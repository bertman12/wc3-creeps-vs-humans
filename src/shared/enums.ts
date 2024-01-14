export enum UNITS {
    dummyCaster = FourCC("h00V"),
    dummyCaster_cenariusGhost = FourCC("h011"),
    playerMainBase = FourCC("h000"),
    goldMine = FourCC("h001"),

    murloc_baseUnit = FourCC("nmrl"),
    infernal = FourCC("ninf"),
    heroChooser = FourCC("e000"),
    itemShop = FourCC("h003"),
    upgradeShop = FourCC("h004"),

    spawnBuilder_tier1 = FourCC("u000"),
    spawnBuilder_tier2 = FourCC("u001"),
    spawnBuilder_tier3 = FourCC("u002"),

    hero_makuraLord = FourCC("H008"),
    hero_overlordArachnathid = FourCC("O001"),
    hero_shadowDemon = FourCC("E003"),
    hero_centaurKhan = FourCC("N002"),
    hero_skeletalFlameMaster = FourCC("E002"),
    hero_gnollWarden = FourCC("H005"),
    hero_murlocKing = FourCC("H002"),
    hero_revenant = FourCC("H007"),
    hero_salamander = FourCC("E001"),
    hero_satyr = FourCC("O000"),
    hero_spiderBroodMaster = FourCC("E004"),
    hero_ursa = FourCC("H006"),

    summon_spiritPig = FourCC("nspp"),
    summon_treant = FourCC("efon"),
    healingWard = FourCC("ohwd"),
}

export enum ABILITIES {
    invulnerable = FourCC("Avul"),
    removeUnitFromSpawn = FourCC("A004"),
    creepControl = FourCC("A00B"),
    playerBase_summonInfernal = FourCC("A00A"),
}

export enum UPGRADES {
    foodCapIncrease = FourCC("R001"),
    tier2Units = FourCC("R002"),
    tier3Units = FourCC("R003"),
    prepTimeEnded = FourCC("R005"),
    creepControlRestrictionTime = FourCC("R006"),
    improvedCreepControl = FourCC("R007"),
}

export enum PlayerIndices {
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

export const primaryCaptureTargets = new Set([UNITS.playerMainBase, UNITS.goldMine]);
