import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { setup_capture } from "./triggers/capture";
import { setup_GoldMineEco } from "./triggers/goldMineEconomy";
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

        trig_itemRecipeSystem();
        trig_setCameraDistance();
        setup_quests();
        setup_capture();
        setup_GoldMineEco();
        delayedTimer(1, setup_playerCreepSpawns);
    } catch (e) {
        print(e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
