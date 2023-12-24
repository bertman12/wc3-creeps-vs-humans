import { UPGRADES } from "src/shared/enums";
import { playerStates } from "src/shared/playerState";
import { adjustFoodCap } from "src/utils/players";
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

            if (tech === UPGRADES.foodCapIncrease) {
                adjustFoodCap(player, 1);
                print("Player learned food cap increase");
            }
        }
    });
}
