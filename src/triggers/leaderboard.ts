import { ptColor } from "src/utils/misc";
import { forEachPlayer, isPlayingUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Leaderboard, Trigger, Unit } from "w3ts";

let killCountLeaderboard: Leaderboard | undefined = undefined;

const playerKillCounts = new Map<number, number>([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
]);

export function setup_leaderBoard() {
    delayedTimer(1, () => {
        const t = Trigger.create();
        t.addAction(() => {
            killCountLeaderboard = Leaderboard.create();
            forEachPlayer((p) => {
                if (isPlayingUser(p)) {
                    killCountLeaderboard?.addItem(`${ptColor(p, p.name)} Kills:`, 0, p);
                }
            });
        });

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

        const currentKills = playerKillCounts.get(killer.owner.id);
        if (currentKills !== undefined) {
            killCountLeaderboard?.setItemValue(killer.id, currentKills + 1);
        }
    });
}
