import { ptColor } from "src/utils/misc";
import { createTextTagOnUnit } from "src/utils/textTag";
import { Item, Trigger, Unit } from "w3ts";

export function setup_createTextForSpellCast() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_EFFECT);

    t.addAction(() => {
        const u = Unit.fromEvent();

        if (u && u.isHero()) {
            const spellNumber = GetSpellAbilityId();
            const spellName = GetAbilityName(spellNumber);
            if (!spellName || spellName === "Default String") return;
            //alt + 0164 ¤
            //alt + 0149 •
            createTextTagOnUnit(u, ptColor(u.owner, "•  ") + spellName ?? "Undefined");
        }
    });
}

export function setup_createTextForItemCast() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_USE_ITEM);

    t.addAction(() => {
        const u = Unit.fromEvent();

        if (u && u.isHero()) {
            const handle = GetSpellTargetItem();
            const item = Item.fromHandle(handle);
            if (!item || !handle) return;
            //alt + 0164 ¤
            //alt + 0149 •
            createTextTagOnUnit(u, ptColor(u.owner, "•  ") + item.name ?? "Undefined");
        }
    });
}
