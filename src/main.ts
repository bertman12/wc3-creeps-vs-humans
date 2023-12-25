import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { setupPlayerStateInstances } from "./shared/playerState";
import { setup_preventMassTeleportGrief } from "./triggers/anti-grief";
import { setup_capture } from "./triggers/capture";
import { setup_GoldMineEco } from "./triggers/goldMineEconomy";
import { setup_leaderBoard } from "./triggers/leaderboard";
import { setup_heroPurchasing } from "./triggers/preparation";
import { playerGetsUpgrade } from "./triggers/upgrades";
import { trig_setCameraDistance } from "./utils/camera";
import { trig_itemRecipeSystem } from "./utils/item";
import { setup_quests } from "./utils/quests";
import { setup_playerCreepSpawns } from "./utils/spawnSystem";
import { delayedTimer } from "./utils/timer";

const BUILD_DATE = compiletime(() => new Date().toUTCString());
const TS_VERSION = compiletime(() => require("typescript").version);
const TSTL_VERSION = compiletime(() => require("typescript-to-lua").version);

compiletime(({ objectData, constants }) => {
    const unit = objectData.units.get(constants.units.Footman);

    if (!unit) {
        return;
    }

    unit.modelFile = "units\\human\\TheCaptain\\TheCaptain.mdl";

    objectData.save();
});

function tsMain() {
    try {
        print(`Build: ${BUILD_DATE}`);
        print(`Typescript: v${TS_VERSION}`);
        print(`Transpiler: v${TSTL_VERSION}`);
        SetGameDifficulty(MAP_DIFFICULTY_INSANE);

        delayedTimer(1, () => {
            ClearMapMusic();
            StopMusic(false);
            PlayMusic(gg_snd_PH1);
        });

        setupPlayerStateInstances();
        trig_itemRecipeSystem();
        trig_setCameraDistance();
        setup_quests();
        setup_capture();
        setup_GoldMineEco();
        playerGetsUpgrade();
        setup_leaderBoard();
        setup_preventMassTeleportGrief();
        setup_heroPurchasing(setup_playerCreepSpawns);
    } catch (e) {
        print(e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
