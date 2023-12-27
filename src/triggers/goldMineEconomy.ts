import { PlayerIndices, UNITS } from "src/shared/enums";
import { tColor, useTempEffect } from "src/utils/misc";
import { adjustGold, forEachUnitTypeOfPlayer } from "src/utils/players";
import { Effect, TextTag, Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export function setup_GoldMineEco() {
    forEachUnitTypeOfPlayer(UNITS.goldMine, Players[PlayerIndices.NeutralHostile], (u) => {
        const trig = Trigger.create();

        trig.registerUnitStateEvent(u, UNIT_STATE_MANA, GREATER_THAN_OR_EQUAL, u.maxMana);

        trig.addAction(() => {
            useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", u, "overhead"), 3);
            const goldAwarded = 25;
            const tag = TextTag.create();
            if (!tag) print("coudlnt make tag");
            tag?.setVisible(true);

            // tag?.setText(`50`, 10, true);
            tag?.setText(`+${tColor(goldAwarded.toFixed(0), "goldenrod")}`, 10, true);
            // tag?.setVelocityAngle(25, 270);
            tag?.setLifespan(2);
            tag?.setFadepoint(0.01);
            tag?.setVelocity(0, 0.05);
            // tag?.setColor(255, 255, 255, 255);
            tag?.setPermanent(false);
            // tag?.setFadepoint(0.01);
            // tag?.setFadepoint
            // delayedTimer(2, () => {
            //     tag?.destroy();
            // });

            tag?.setPosUnit(u, 10);

            adjustGold(u.owner, goldAwarded);
            u.mana = 0;
        });
    });
}
