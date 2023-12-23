function InitGlobals()
end

function CreateUnitsForPlayer0()
local p = Player(0)
local u
local unitID
local t
local life

u = BlzCreateUnitWithSkin(p, FourCC("nmrl"), 1228.0, -884.7, -69.094, FourCC("nmrl"))
u = BlzCreateUnitWithSkin(p, FourCC("nmrm"), 1429.4, -794.9, 267.486, FourCC("nmrm"))
u = BlzCreateUnitWithSkin(p, FourCC("nmrr"), 974.2, -970.9, -59.030, FourCC("nmrr"))
u = BlzCreateUnitWithSkin(p, FourCC("nmpg"), 1416.2, -1115.3, -84.083, FourCC("nmpg"))
u = BlzCreateUnitWithSkin(p, FourCC("nmfs"), 1209.9, -1152.9, -84.331, FourCC("nmfs"))
u = BlzCreateUnitWithSkin(p, FourCC("nmmu"), 1001.7, -1219.9, -36.006, FourCC("nmmu"))
u = BlzCreateUnitWithSkin(p, FourCC("nfrl"), 1562.7, 496.5, 215.800, FourCC("nfrl"))
u = BlzCreateUnitWithSkin(p, FourCC("nfrs"), 1808.4, 330.1, 267.327, FourCC("nfrs"))
u = BlzCreateUnitWithSkin(p, FourCC("nfrb"), 1529.6, 698.0, 214.800, FourCC("nfrb"))
u = BlzCreateUnitWithSkin(p, FourCC("nfrg"), 2043.2, 217.9, 306.868, FourCC("nfrg"))
u = BlzCreateUnitWithSkin(p, FourCC("nfre"), 1253.3, 855.9, 16.733, FourCC("nfre"))
u = BlzCreateUnitWithSkin(p, FourCC("nfra"), 1691.5, 353.5, 80.269, FourCC("nfra"))
u = BlzCreateUnitWithSkin(p, FourCC("nspr"), 398.0, 1244.2, 170.568, FourCC("nspr"))
u = BlzCreateUnitWithSkin(p, FourCC("nssp"), 223.7, 1280.3, 247.991, FourCC("nssp"))
u = BlzCreateUnitWithSkin(p, FourCC("nsgt"), -17.2, 1268.8, 0.736, FourCC("nsgt"))
u = BlzCreateUnitWithSkin(p, FourCC("nsbm"), -228.4, 1297.5, 278.567, FourCC("nsbm"))
u = BlzCreateUnitWithSkin(p, FourCC("nltl"), -886.9, 910.7, 261.735, FourCC("nltl"))
u = BlzCreateUnitWithSkin(p, FourCC("nthl"), -1093.6, 682.0, 232.016, FourCC("nthl"))
u = BlzCreateUnitWithSkin(p, FourCC("nstw"), -1182.8, 421.8, 324.381, FourCC("nstw"))
u = BlzCreateUnitWithSkin(p, FourCC("nsty"), -1387.0, -361.5, 237.422, FourCC("nsty"))
u = BlzCreateUnitWithSkin(p, FourCC("nsat"), -1290.3, -508.3, 140.102, FourCC("nsat"))
u = BlzCreateUnitWithSkin(p, FourCC("nsts"), -1136.6, -685.8, 162.449, FourCC("nsts"))
u = BlzCreateUnitWithSkin(p, FourCC("nstl"), -1039.8, -869.5, 263.153, FourCC("nstl"))
u = BlzCreateUnitWithSkin(p, FourCC("nsth"), -908.0, -1048.6, 31.147, FourCC("nsth"))
u = BlzCreateUnitWithSkin(p, FourCC("nslm"), -287.1, -1328.7, 2.670, FourCC("nslm"))
u = BlzCreateUnitWithSkin(p, FourCC("nslf"), -7.2, -1321.6, 288.521, FourCC("nslf"))
u = BlzCreateUnitWithSkin(p, FourCC("nsln"), 241.5, -1359.0, 20.732, FourCC("nsln"))
u = BlzCreateUnitWithSkin(p, FourCC("ndtr"), 545.7, -391.6, 246.574, FourCC("ndtr"))
u = BlzCreateUnitWithSkin(p, FourCC("ndtp"), 613.2, -328.8, 54.230, FourCC("ndtp"))
u = BlzCreateUnitWithSkin(p, FourCC("ndtt"), 681.3, -262.8, 54.219, FourCC("ndtt"))
u = BlzCreateUnitWithSkin(p, FourCC("ndtb"), 799.1, -153.5, 209.669, FourCC("ndtb"))
u = BlzCreateUnitWithSkin(p, FourCC("ndth"), 865.4, -97.9, 339.136, FourCC("ndth"))
u = BlzCreateUnitWithSkin(p, FourCC("ndtw"), 1009.9, 26.3, 316.526, FourCC("ndtw"))
u = BlzCreateUnitWithSkin(p, FourCC("nfsp"), -544.2, -304.1, 256.945, FourCC("nfsp"))
u = BlzCreateUnitWithSkin(p, FourCC("nftr"), -622.0, -226.3, 208.439, FourCC("nftr"))
u = BlzCreateUnitWithSkin(p, FourCC("nftt"), -453.1, -398.1, 10.756, FourCC("nftt"))
u = BlzCreateUnitWithSkin(p, FourCC("nftb"), -352.5, -484.2, 338.049, FourCC("nftb"))
u = BlzCreateUnitWithSkin(p, FourCC("nfsh"), -225.6, -549.3, 175.940, FourCC("nfsh"))
u = BlzCreateUnitWithSkin(p, FourCC("nftk"), -112.5, -654.5, 231.764, FourCC("nftk"))
end

function CreatePlayerBuildings()
end

function CreatePlayerUnits()
CreateUnitsForPlayer0()
end

function CreateAllUnits()
CreatePlayerBuildings()
CreatePlayerUnits()
end

function InitCustomPlayerSlots()
SetPlayerStartLocation(Player(0), 0)
SetPlayerColor(Player(0), ConvertPlayerColor(0))
SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
SetPlayerRaceSelectable(Player(0), true)
SetPlayerController(Player(0), MAP_CONTROL_USER)
end

function InitCustomTeams()
SetPlayerTeam(Player(0), 0)
end

function main()
SetCameraBounds(-7424.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), -7680.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM), 7424.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), 7168.0 - GetCameraMargin(CAMERA_MARGIN_TOP), -7424.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), 7168.0 - GetCameraMargin(CAMERA_MARGIN_TOP), 7424.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), -7680.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM))
SetDayNightModels("Environment\\DNC\\DNCAshenvale\\DNCAshenvaleTerrain\\DNCAshenvaleTerrain.mdl", "Environment\\DNC\\DNCAshenvale\\DNCAshenvaleUnit\\DNCAshenvaleUnit.mdl")
NewSoundEnvironment("Default")
SetAmbientDaySound("AshenvaleDay")
SetAmbientNightSound("AshenvaleNight")
SetMapMusic("Music", true, 0)
CreateAllUnits()
InitBlizzard()
InitGlobals()
end

function config()
SetMapName("TRIGSTR_001")
SetMapDescription("TRIGSTR_003")
SetPlayers(1)
SetTeams(1)
SetGamePlacement(MAP_PLACEMENT_USE_MAP_SETTINGS)
DefineStartLocation(0, 0.0, 0.0)
InitCustomPlayerSlots()
SetPlayerSlotAvailable(Player(0), MAP_CONTROL_USER)
InitGenericPlayerSlots()
end

