import { UNITS } from "src/shared/enums";
import { forEachPlayer, isPlayingUser } from "src/utils/players";
import { Trigger, Unit } from "w3ts";
import { MultiboardColumnIndexMap, adjustMultiboardItemValue } from "./multiboard";

export function setup_capture() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addAction(() => {
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const attacker = Unit.fromHandle(GetAttacker());

        if (victim && attacker && victim.typeId === UNITS.goldMine) {
            if (victim.life <= victim.maxLife / 3) {
                forEachPlayer((p) => {
                    if (isPlayingUser(p) && p.isPlayerAlly(attacker.owner)) {
                        adjustMultiboardItemValue(attacker.owner.id, MultiboardColumnIndexMap.PlayerMines, 1);
                        adjustMultiboardItemValue(victim.owner.id, MultiboardColumnIndexMap.PlayerMines, -1);

                        victim.owner = p;
                        victim.life = victim.maxLife;

                        return;
                    }
                });
            }
        }
    });
}
