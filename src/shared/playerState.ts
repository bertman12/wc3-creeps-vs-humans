import { notifyPlayer, ptColor, tColor } from "src/utils/misc";
import { forEachPlayer, forEachUnitOfPlayer, isPlayingUser } from "src/utils/players";
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
                if (state.ownedSpawn?.spawnOwner !== this.player && state.ownedSpawn?.spawnBase?.isAlive()) {
                    hasPlayerWon = false;
                }
            });

            if (hasPlayerWon) {
                notifyPlayer(`${ptColor(this.player, this.player.name)} has won!`);
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
            playerStates.set(p.id, new PlayerState(p));
        }
    });
}
