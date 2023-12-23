import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function setup_quests() {
    Timer.create().start(1, false, () => {
        addQuest(
            "Basic Game Info",
            `\n
            \n${tColor("Main Objective", "goldenrod")}: Survive for 9 nights
        `,
            "ReplaceableTextures\\CommandButtons\\BTNPeasant.blp"
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
