import { notifyPlayer, ptColor, tColor } from "src/utils/misc";
import { adjustLumber, forEachPlayer, forEachUnitOfPlayer, isPlayingUser } from "src/utils/players";
import { SpawnData } from "src/utils/spawnSystem";
import { FogModifier, MapPlayer, Trigger, Unit } from "w3ts";
import { UNITS } from "./enums";

export const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
export class PlayerState {
    player: MapPlayer;
    playerHero: Unit | undefined;
    ownedSpawn: SpawnData | undefined;
    baseGoldIncome = 50;

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

    setup_defeatPlayer(playerBase: Unit) {
        const t = Trigger.create();

        t.registerUnitEvent(playerBase, EVENT_UNIT_DEATH);

        t.addAction(() => {
            this.cleanupPlayer();

            notifyPlayer(`${ptColor(this.player, this.player.name)} has been ${tColor("defeated", "red")}!`);
            const clearFogState = FogModifier.create(this.player, FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
            clearFogState?.start();

            //Check if any other player spawns remain
            let hasPlayerWon = true;

            playerStates.forEach((state) => {
                //Check each player's spawn beside your own
                if (state.ownedSpawn?.spawnBase?.isAlive() && state.ownedSpawn.spawnOwner !== this.player) {
                    hasPlayerWon = false;
                }

                if (!this.ownedSpawn?.spawnBase?.isAlive()) {
                    hasPlayerWon = false;
                }
            });

            if (hasPlayerWon) {
                notifyPlayer(`${ptColor(this.player, this.player.name)} has won!`);
                ClearMapMusic();
                StopMusic(false);
                PlayMusic(gg_snd_PH1);

                const clearFogState = FogModifier.create(this.player, FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
                clearFogState?.start();
            }
        });
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
            SetPlayerHandicapXP(p.handle, 0.6);
        }
    });
}

export function getPlayerState(player: MapPlayer) {
    const state = playerStates.get(player.id);

    if (state) {
        return state;
    }
}
