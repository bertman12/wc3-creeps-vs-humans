import { playerStates } from "src/shared/playerState";
import { MapPlayer, Trigger } from "w3ts";

export function playerGetsUpgrade() {
    //grab the map player who got the upgrade
    //set the same tech they upgraded for their allied spawn computer players as well
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_RESEARCH_FINISH);

    t.addAction(() => {
        const tech = GetResearched();
        const player = MapPlayer.fromEvent();

        //We are upgrading the allied computers for the player as well.
        if (player) {
            const state = playerStates.get(player.id);
            if (state) {
                const techLevel = GetPlayerTechCount(player.handle, tech, true);

                state.ownedSpawn?.alliedPlayerPool.forEach((p) => {
                    p.setTechResearched(tech, techLevel);
                });
            }
        }
    });
}
