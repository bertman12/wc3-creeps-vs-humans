import { playerStates } from "src/shared/playerState";
import { notifyPlayer, ptColor, tColor } from "src/utils/misc";
import { adjustGold, forEachPlayer, isPlayingUser } from "src/utils/players";
import { MapPlayer, Sound, Trigger, Unit } from "w3ts";
import { MultiboardColumnIndexMap, adjustMultiboardItemValue } from "./multiboard";

const storedSoundHandles: sound[] = [];

export function setup_trackPlayerKillCount() {
    const t = Trigger.create();
    const heroKillSounds = [gg_snd_MuradinTaunt1];

    heroKillSounds.forEach((s) => {
        const killSound = Sound.fromHandle(s);

        if (killSound) {
            storedSoundHandles.push(killSound.handle);
        }
    });

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addAction(() => {
        const deadUnit = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetKillingUnit());

        if (!deadUnit || !attacker) return;
        let playerToAward: null | MapPlayer = null;

        forEachPlayer((p) => {
            if (p.isPlayerAlly(attacker.owner) && isPlayingUser(p)) {
                adjustMultiboardItemValue(p.id, MultiboardColumnIndexMap.PlayerKills, 1);
                playerToAward = p;

                if (deadUnit.isHero() && playerToAward) {
                    const state = playerStates.get(playerToAward.id);

                    if (!state || !state.playerHero) return;

                    const heroLevelDiff = deadUnit.getHeroLevel() - state.playerHero.getHeroLevel();
                    let goldAward = 250 + 25 * deadUnit.getHeroLevel();

                    if (heroLevelDiff > 0) {
                        goldAward += 100 * heroLevelDiff;
                    }

                    const randomIndex = math.random(0, storedSoundHandles.length - 1);

                    StartSound(storedSoundHandles[randomIndex]);
                    KillSoundWhenDone(storedSoundHandles[randomIndex]);

                    notifyPlayer(`${ptColor(playerToAward, playerToAward.name)} has slain ${ptColor(deadUnit.owner, deadUnit.owner.name)}'s hero for ${tColor(goldAward.toFixed(0) + " gold", "yellow")}!`);
                    adjustGold(playerToAward, goldAward);
                }

                return;
            }
        });
    });
}
