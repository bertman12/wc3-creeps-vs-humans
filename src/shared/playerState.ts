import { MultiboardColumnIndexMap, multiboardData } from "src/triggers/multiboard";
import { notifyPlayer, ptColor, tColor, useTempEffect } from "src/utils/misc";
import { adjustGold, adjustLumber, forEachPlayer, forEachUnitOfPlayer, isPlayingUser, isUser } from "src/utils/players";
import { SpawnData } from "src/utils/spawnSystem";
import { createTextTagOnUnit } from "src/utils/textTag";
import { delayedTimer } from "src/utils/timer";
import { Effect, FogModifier, MapPlayer, Trigger, Unit } from "w3ts";
import { ABILITIES, UNITS } from "./enums";

export const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
export class PlayerState {
    player: MapPlayer;
    playerHero: Unit | undefined;
    ownedSpawn: SpawnData | undefined;
    baseGoldIncome = 50;
    bonusUnitsSpawned = 0;

    constructor(player: MapPlayer) {
        this.player = player;
    }

    cleanupPlayer() {
        this.ownedSpawn?.cleanupSpawn();
        forEachUnitOfPlayer(this.player, (u) => {
            if (u.typeId !== UNITS.goldMine) {
                u.kill();
            }
        });
    }

    checkWinCondition() {
        let hasWon = true;

        playerStates.forEach((state) => {
            //Is my own base alive?
            if (!this.ownedSpawn?.spawnBase?.isAlive()) {
                hasWon = false;
            }

            //Are there any other player bases alive?
            if (state.ownedSpawn?.spawnOwner !== this.player && state.ownedSpawn?.spawnBase?.isAlive()) {
                hasWon = false;
            }
        });

        if (hasWon) {
            //delay so there is some space between the losing players message
            delayedTimer(1, () => {
                notifyPlayer(`${ptColor(this.player, this.player.name)} has won!`);
                ClearMapMusic();
                StopMusic(false);
                PlayMusic(gg_snd_PH1);

                const clearFogState = FogModifier.create(this.player, FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
                clearFogState?.start();
            });
        }

        return hasWon;
    }

    setup_defeatPlayer(playerBase: Unit) {
        const t = Trigger.create();

        t.registerUnitEvent(playerBase, EVENT_UNIT_DEATH);

        t.addAction(() => {
            this.cleanupPlayer();
            notifyPlayer(`${ptColor(this.player, this.player.name)} has been ${tColor("defeated", "red")}!`);
            const clearFogState = FogModifier.create(this.player, FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
            clearFogState?.start();

            //Check all players to see if there is a winner.
            playerStates.forEach((pState) => {
                if (pState.player !== this.player) {
                    pState.checkWinCondition();
                }
            });
        });
    }

    /**
     * Triggered when a gold mine is captured
     */
    adjustBaseGoldIncome() {
        let mostMines = 0;

        forEachPlayer((p) => {
            if (isUser(p)) {
                const mineCount = multiboardData[p.id][MultiboardColumnIndexMap.PlayerMines];

                if (mineCount === undefined) return;

                if (mineCount > mostMines) {
                    mostMines = mineCount;
                }
            }
        });

        const playerMineCount = multiboardData[this.player.id][MultiboardColumnIndexMap.PlayerMines];
        const diff = mostMines - playerMineCount;

        if (diff > 0) {
            this.baseGoldIncome = 50 + 8 * diff;
        } else if (diff <= 0) {
            this.baseGoldIncome = 50;
        }

        //if the leading player has more than 4 mines than you, you get bonus units spawned in your wave.
        if (this.ownedSpawn && diff > 4) {
            this.ownedSpawn.bonusUnitsSpawned = Math.floor((diff - 4) / 2);
        } else if (this.ownedSpawn) {
            this.ownedSpawn.bonusUnitsSpawned = 0;
        }
    }

    //Remove logic from spawn class
    setup_grantBaseIncome(playerBase: Unit) {
        if (playerBase) {
            playerBase.startAbilityCooldown(ABILITIES.playerBase_summonInfernal, 120);

            const trig = Trigger.create();

            trig.registerUnitStateEvent(playerBase, UNIT_STATE_MANA, GREATER_THAN_OR_EQUAL, playerBase.maxMana);

            trig.addAction(() => {
                if (playerBase) {
                    this.adjustBaseGoldIncome();

                    useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", playerBase, "overhead"), 3);

                    const goldAwarded = this.baseGoldIncome;
                    adjustGold(playerBase.owner, goldAwarded);
                    playerBase.mana = 0;
                    createTextTagOnUnit(playerBase, tColor(`+${goldAwarded.toFixed(0)}`, "goldenrod"));
                }
            });
        }
    }
}

/**
 * Player states will initially not have a hero associated with them and also not have a spawn associated with them until the game starts
 */
export function setupPlayerStateInstances() {
    forEachPlayer((p) => {
        if (isPlayingUser(p)) {
            print(`Player state setup for ${ptColor(p, p.name)}`);
            const state = new PlayerState(p);
            playerStates.set(p.id, state);
            adjustLumber(p, 1000);
            SetPlayerHandicapXP(p.handle, 0.5);
        }
    });
}

export function getPlayerState(player: MapPlayer) {
    const state = playerStates.get(player.id);

    if (state) {
        return state;
    }
}
