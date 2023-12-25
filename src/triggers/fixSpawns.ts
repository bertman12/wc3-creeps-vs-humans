import { playerStates } from "src/shared/playerState";
import { Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export function setup_fixSpawns() {
    const tStart = Trigger.create();
    tStart.registerPlayerChatEvent(Players[0], "-fixSpawns", false);
    tStart.addAction(() => {
        playerStates.forEach((state) => {
            state.ownedSpawn?.addUnitsInSpawnBuilderRegionToSimplePool();
        });
    });

}
