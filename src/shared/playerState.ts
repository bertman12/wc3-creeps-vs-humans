import { forEachPlayer, isPlayingUser } from "src/utils/players";
import { SpawnData } from "src/utils/spawnSystem";
import { MapPlayer, Unit } from "w3ts";

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
