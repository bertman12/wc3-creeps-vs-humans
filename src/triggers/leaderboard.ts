import { ptColor } from "src/utils/misc";
import { forEachPlayer, isPlayingUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Multiboard, MultiboardItem, Trigger, Unit } from "w3ts";

let killCountMultiboard: Multiboard | undefined = undefined;

/**
 * Initially items are undefined
 */
const multiboardItems = new Map<number, MultiboardItem | undefined>([
    [0, undefined],
    [1, undefined],
    [2, undefined],
    [3, undefined],
    [4, undefined],
    [5, undefined],
]);

const playerKills = new Map<number, number>([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
]);

export function setup_multiBoard() {
    delayedTimer(1, () => {
        killCountMultiboard = Multiboard.create();

        if (!killCountMultiboard) {
            print("Unable to create multiboard!");
            return;
        }

        MultiboardSetTitleText(killCountMultiboard?.handle, "Player Kills");

        forEachPlayer((p) => {
            if (isPlayingUser(p)) {
                const item = killCountMultiboard?.createItem(p.id, 1);

                item?.setStyle(true, false);
                item?.setValue(`${ptColor(p, p.name)} Kills: 0`);
                item?.setWidth(20);

                multiboardItems.set(p.id, item);
            }
        });

        killCountMultiboard.display(true);

        trackPlayerKillCount();
    });
}

function trackPlayerKillCount() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addAction(() => {
        const u = Unit.fromEvent();
        const killer = Unit.fromHandle(GetKillingUnit());

        if (!u || !killer) return;

        const multiboardItem = multiboardItems.get(killer.owner.id);
        const currentKills = playerKills.get(killer.owner.id);

        if (multiboardItem !== undefined && currentKills !== undefined) {
            multiboardItem.setValue(`${ptColor(killer.owner, killer.owner.name)} Kills: ${currentKills + 1}`);
            multiboardItem.setStyle(true, false);
        }
    });
}
