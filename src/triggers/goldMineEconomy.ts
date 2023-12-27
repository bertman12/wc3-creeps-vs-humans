import { PlayerIndices, UNITS } from "src/shared/enums";
import { tColor, useTempEffect } from "src/utils/misc";
import { adjustGold, forEachUnitTypeOfPlayer } from "src/utils/players";
import { createTextTagOnUnit } from "src/utils/textTag";
import { Effect, Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export function setup_GoldMineEco() {
    forEachUnitTypeOfPlayer(UNITS.goldMine, Players[PlayerIndices.NeutralHostile], (u) => {
        const trig = Trigger.create();

        trig.registerUnitStateEvent(u, UNIT_STATE_MANA, GREATER_THAN_OR_EQUAL, u.maxMana);

        trig.addAction(() => {
            useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", u, "overhead"), 3);
            const goldAwarded = 25;
            createTextTagOnUnit(u, tColor(`+${goldAwarded.toFixed(0)}`, "goldenrod"));

            adjustGold(u.owner, goldAwarded);
            u.mana = 0;

            u.setAnimation("stand");
            u.addAnimationProps("work fifth", true);
        });
    });
}
