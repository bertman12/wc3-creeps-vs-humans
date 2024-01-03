import { UPGRADES } from "src/shared/enums";
import { playerStates } from "src/shared/playerState";
import { notifyPlayer, ptColor, tColor } from "src/utils/misc";
import { adjustFoodCap, forEachPlayer, isPlayingUser } from "src/utils/players";
import { MapPlayer, Trigger } from "w3ts";
import { MultiboardColumnIndexMap, adjustMultiboardItemValue, setMultiboardItemIcon } from "./multiboard";

export function setup_playerGetsUpgrade() {
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
            }

            if (tech === UPGRADES.tier2Units) {
                notifyPlayer(`${ptColor(player, player.name)} has unlocked ${tColor("Tier 2", "magenta")} units.`);
                adjustMultiboardItemValue(player.id, MultiboardColumnIndexMap.PlayerTier, 1);
                setMultiboardItemIcon(player.id, MultiboardColumnIndexMap.PlayerTier, "ReplaceableTextures\\CommandButtons\\BTNImprovedStrengthOfTheWild.blp");
            }

            if (tech === UPGRADES.tier3Units) {
                notifyPlayer(`${ptColor(player, player.name)} has unlocked ${tColor("Tier 3", "magenta")} units.`);
                adjustMultiboardItemValue(player.id, MultiboardColumnIndexMap.PlayerTier, 1);
                setMultiboardItemIcon(player.id, MultiboardColumnIndexMap.PlayerTier, "ReplaceableTextures\\CommandButtons\\BTNAdvancedStrengthOfTheWild.blp");
            }
        }
    });
}

export function researchCreepControl() {
    forEachPlayer((p) => {
        if (isPlayingUser(p)) {
            p.setTechResearched(UPGRADES.creepControlRestrictionTime, 1);
        }
    });

    // notifyPlayer("Players may now use the |cffffcc00Creep Control|r ability on their base to control where their creeps attack for a limited time.");
}
//When the fox is jumping across the river i will follow it. if it crosses the mountain, i will climb, if dives into the sea, i will swim and if it soars to the sky i will die