import { Rectangle, Region, Trigger, Unit } from "w3ts";
import { OrderId } from "w3ts/globals";

export function setup_preventMassTeleportGrief() {
    const t = Trigger.create();

    const previewRegion = Region.create();
    const previewRectangle = Rectangle.fromHandle(gg_rct_IllegalTeleportRegion);
    if (!previewRectangle || !previewRegion) {
        return;
    }

    previewRegion.addRect(previewRectangle);

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CHANNEL);

    t.addAction(() => {
        //player casts teleport check if the unit they are teleporting to is in region
        const spellNumberCast = GetSpellAbilityId();
        const illegalSpells = [FourCC("Almt"), FourCC("A01Y"), FourCC("A00H"), 1095331188];

        if (illegalSpells.includes(spellNumberCast)) {
            const caster = Unit.fromEvent();

            if (caster && IsPointInRegion(previewRegion.handle, GetSpellTargetX(), GetSpellTargetY())) {
                caster.issueImmediateOrder(OrderId.Stop);
                print("|cffff0000Illegal Teleport!|r");
            }
        }
    });
}
