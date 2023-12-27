import { notifyPlayer, ptColor } from "src/utils/misc";
import { forEachPlayer } from "src/utils/players";
import { MapPlayer, Trigger } from "w3ts";

export function setup_playerLeaves() {
    const t = Trigger.create();

    forEachPlayer((p) => {
        TriggerRegisterPlayerEventLeave(t.handle, p.handle);
    });

    t.addAction(() => {
        const leaver = MapPlayer.fromHandle(GetTriggerPlayer());

        if (leaver) {
            notifyPlayer(`${ptColor(leaver, leaver.name)} has left.`);
        }
    });
}
