import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { setupPlayerStateInstances } from "./shared/playerState";
import { setup_preventMassTeleportGrief } from "./triggers/anti-grief";
import { setup_capture } from "./triggers/capture";
import { setup_fixSpawns } from "./triggers/fixSpawns";
import { setup_GoldMineEco } from "./triggers/goldMineEconomy";
import { setup_trackPlayerKillCount } from "./triggers/hero-kill";
import { setup_multiBoard } from "./triggers/multiboard";
import { setup_playerLeaves } from "./triggers/player-leaves";
import { setup_preparation } from "./triggers/preparation";
import { setup_playerGetsUpgrade } from "./triggers/upgrades";
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
        /**
         * @step 1
         */
        setupPlayerStateInstances();

        delayedTimer(1, () => {
            ClearMapMusic();
            StopMusic(false);
            PlayMusic(gg_snd_NightElfX1);
        });

        trig_itemRecipeSystem();
        trig_setCameraDistance();
        setup_quests();
        setup_capture();
        setup_GoldMineEco();
        setup_playerGetsUpgrade();
        setup_multiBoard();
        setup_preventMassTeleportGrief();
        setup_preparation(setup_playerCreepSpawns);
        setup_fixSpawns();
        setup_playerLeaves();
        setup_trackPlayerKillCount();
        /**
         * @step 2
         */
    } catch (e) {
        print(e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
