export enum UNITS {
    dummyCaster = FourCC("h00V"),
    dummyCaster_cenariusGhost = FourCC("h011"),
    murlocBase = FourCC("h000"),
    goldMine = FourCC("h001"),
}

export enum PlayerIndices {
    KingdomOfAlexandria = 9,
    HumanDefenders = 18,
    NeutralHostile = 24,
    NeutralPassive = 25,
    Items = 27,
}

//Can find looking up models for a spell at the Art - Target field
export type MINIMAP_ICONS =
    | "UI\\Minimap\\MiniMap-ControlPoint.mdl"
    | "UI\\Minimap\\MiniMap-QuestGiver.mdl"
    | "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl"
    | "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl"
    | "UI\\Minimap\\Minimap-QuestTurnIn.mdl"
    | "UI\\Minimap\\MiniMap-Hero.mdl"
    | "UI\\Minimap\\Minimap-Ping.mdl"
    | "UI\\Minimap\\MiniMap-Item.mdl"
    | "UI\\Minimap\\MiniMap-NeutralBuilding.mdl";

export enum MinimapIconPath {
    controlPoint = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questGiver = "UI\\Minimap\\MiniMap-QuestGiver.mdl",
    questObjectiveBonus = "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl",
    questObjectivePrimary = "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl",
    questTurnIn = "UI\\Minimap\\Minimap-QuestTurnIn.mdl",
    hero = "UI\\Minimap\\MiniMap-Hero.mdl",
    item = "UI\\Minimap\\MiniMap-Item.mdl",
    neutralBuilding = "UI\\Minimap\\MiniMap-NeutralBuilding.mdl",
    ping = "UI\\Minimap\\Minimap-Ping.mdl",
}

export const minimapIconPathsSet = new Set<MINIMAP_ICONS>([
    "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    "UI\\Minimap\\MiniMap-Hero.mdl",
    "UI\\Minimap\\MiniMap-Item.mdl",
    "UI\\Minimap\\MiniMap-NeutralBuilding.mdl",
    "UI\\Minimap\\MiniMap-QuestGiver.mdl",
    "UI\\Minimap\\Minimap-Ping.mdl",
    "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl",
    "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl",
    "UI\\Minimap\\Minimap-QuestTurnIn.mdl",
]);

export const primaryCaptureTargets = new Set([UNITS.murlocBase, UNITS.goldMine]);