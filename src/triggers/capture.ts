import { UNITS } from "src/shared/enums";
import { forEachPlayer, isUser } from "src/utils/players";
import { Trigger, Unit } from "w3ts";
import { MultiboardColumnIndexMap, adjustMultiboardItemValue } from "./multiboard";

export function setup_capture() {
    const onDamageTrig = Trigger.create();

    onDamageTrig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DAMAGED);

    onDamageTrig.addAction(() => {
        const victim = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetEventDamageSource());

        if (victim && attacker && victim.typeId === UNITS.goldMine) {
            if (victim.life <= victim.maxLife / 3) {
                forEachPlayer((p) => {
                    if (isUser(p) && p.isPlayerAlly(attacker.owner)) {
                        adjustMultiboardItemValue(p.id, MultiboardColumnIndexMap.PlayerMines, 1);

                        if (isUser(victim.owner)) {
                            adjustMultiboardItemValue(victim.owner.id, MultiboardColumnIndexMap.PlayerMines, -1);
                        }

                        victim.owner = p;
                        victim.life = victim.maxLife;

                        return;
                    }
                });
            }
        }
    });
}
