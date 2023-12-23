import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function setup_quests() {
    Timer.create().start(1, false, () => {
        addQuest(
            "Basic Game Info",
            `\n
            \n${tColor("Main Objective", "goldenrod")}: Kill all enemy players.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNPeasant.blp"
        );

        addQuest(
            "Commands",
            `
            \n${tColor("-cam ####", "goldenrod")}: Sets the camera distance.
            \n${tColor("-start", "goldenrod")}: Only use if the next round hasn't started and it is night and you see no timer.
            \n${tColor("-heromode", "goldenrod")}: Experimental - Sets the game mode to hero mode. Must be used before preparation timer at the beginning has ended.
        `,
            "ReplaceableTextures\\WorldEditUI\\Doodad-Cinematic.blp",
            false
        );

        addQuest("|cffffcc00Creeps vs Humans - alpha|r", "Created by JediMindTrix/NihilismIsDeath", "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp", false);
    });
}

export function addQuest(title: string, description: string, iconPath?: string, required: boolean = true) {
    const q = Quest.create();
    if (q) {
        q.setTitle(title);
        q.required = required;
        q.setDescription(description);
        if (iconPath) {
            q.setIcon(iconPath);
        }
    }
}
