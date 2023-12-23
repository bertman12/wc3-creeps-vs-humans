// import { GameConfig } from "src/shared/GameConfig";
// import { ITEMS, MinimapIconPath, PlayerIndices, UNITS } from "src/shared/enums";
// import { RoundManager } from "src/shared/round-manager";
// import { primaryCapturableHumanTargets } from "src/towns";
import { MinimapIconPath, primaryCaptureTargets } from "src/shared/enums";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitTypeOfPlayer, isPlayingUser } from "src/utils/players";
import { Effect, MapPlayer, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

const UNDEAD_PLAYERS = [Players[10], Players[12], Players[13], Players[14], Players[15], Players[16], Players[17], Players[19], Players[20], Players[21], Players[22], Players[23]];
const defaultAttackX = -1200;
const defaultAttackY = -15500;
let currentUndeadPlayerIndex = 0;
let isUndeadHeroSoundAlreadyPlaying = false;

/**
 * Cycles all players from the undead player array then restarts once it goes through all players
 */
function getNextUndeadPlayer() {
    let player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];

    if (currentUndeadPlayerIndex >= UNDEAD_PLAYERS.length) {
        currentUndeadPlayerIndex = 0;
        player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];
    } else {
        currentUndeadPlayerIndex++;
    }

    return player;
}

//30 seconds being the hard spawn, 15 second intervals being the normal spawn difficulty; maybe fr
const waveIntervalOptions = [15, 30];

const MAX_ZOMBIE_COUNT = 200 as const;

let currentZombieCount = 0;

let playerSpawns: SpawnData[] = [];

// function removeUndeadFromCount() {
//     const t = Trigger.create();
//     t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
//     t.addAction(() => {
//         const u = Unit.fromEvent();

//         if (u && !u.owner.isPlayerAlly(Players[0])) {
//             currentZombieCount--;
//         }
//     });
// }

// /**
//  * Handles zombie spawns each night
//  */
// export function undeadNightStart() {
//     currentZombieCount = 0;

//     //Order remaining undead to attack the capital
//     forEachPlayer((p) => {
//         if (!p.isPlayerAlly(Players[0]) && p !== Players[0] && p !== Players[9] && p !== Players[PlayerIndices.HumanDefenders]) {
//             forEachUnitOfPlayer(p, (u) => {
//                 u.issueOrderAt(OrderId.Attack, GameConfig.defaultEnemyAttackX, GameConfig.defaultEnemyAttackY);
//             });
//         }
//     });

//     currentSpawns.forEach((config) => {
//         config.startSpawning();
//     });
// }

// export function init_undead() {
//     Timer.create().start(10, false, () => {
//         Sound.fromHandle(gg_snd_Hint)?.start();
//         removeUndeadFromCount();
//         undeadDayStart();
//         print("");
//         // print(`Player 1 Type ${tColor("-start", "goldenrod")} to start the game.`);
//     });
// }

export function setup_createCreepSpawns() {
    playerSpawns.forEach((spawn) => spawn.cleanupSpawn());

    playerSpawns = [];

    // const validUndeadSpawns = [gg_rct_zombieSpawn2, gg_rct_zNorthSpawn1, gg_rct_ZombieSpawn1, gg_rct_zWestSpawn1, gg_rct_zEastCapitalSpawn];
    const spawns: rect[] = [];

    // [MIN_SPAWN_AMOUNT, validUndeadSpawns.length] spawns will be chosen
    // const spawnCount = Math.ceil(Math.random() * validUndeadSpawns.length);

    //If the chosen amount is less than the minimum then set to min amount
    // if (spawnCount < MIN_SPAWN_AMOUNT) {
    //     spawnCount = MIN_SPAWN_AMOUNT;
    // }

    // const tempSet = new Set<rect>();

    // while (tempSet.size !== spawnCount) {
    //     const randomIndex = Math.floor(Math.random() * validUndeadSpawns.length);
    //     const chosenSpawn = validUndeadSpawns[randomIndex];

    //     if (!tempSet.has(chosenSpawn)) {
    //         tempSet.add(chosenSpawn);
    //     }
    // }

    // spawns = [...tempSet];
    // //On the 14th night, all spawns are active
    // if (RoundManager.currentRound >= 14) {
    //     spawns = validUndeadSpawns;
    // }
    // //Every 5th night, all spawns are active
    // else if (RoundManager.currentRound % 5 === 0) {
    //     spawns = validUndeadSpawns;
    // }

    // const spawnBoss = RoundManager.currentRound % 3 === 0;

    // const spawnConfigs = spawns.map((zone, index) => {
    //     if (index === 0 && spawnBoss) {
    //         return new SpawnData(zone, false, spawnBoss);
    //     }
    //     return new SpawnData(zone);
    // });

    /**
     * @SIMPLIFIED
     */
    // const spawnConfigs = validUndeadSpawns.map((zone, index) => {
    //     if (index === 0 && spawnBoss) {
    //         return new SpawnData(zone, false, spawnBoss);
    //     }

    //     return new SpawnData(zone);
    // });

    // spawnConfigs.forEach((config) => {
    //     const newTarget = config.chooseForceAttackTarget(Point.create(config.spawnRec?.centerX ?? 0, config.spawnRec?.centerY ?? 0));

    //     if (newTarget) {
    //         config.applyAttackTargetEffects(newTarget);
    //     }
    // });

    // currentSpawns = spawnConfigs;
}

type UnitCategory = "infantry" | "missile" | "caster" | "siege" | "hero";

enum SpawnDifficulty {
    normal,
    hard,
    boss,
    final,
}

class SpawnData {
    public spawnRec: Rectangle | undefined;
    /**
     * Determines whether or not to show effects and minimap icons for the spawn.
     */
    public hideUI: boolean = false;
    //This will determine the wave interval timer, which thus determines units spawned per wave
    public spawnDifficulty = 0;
    //random number from the array;
    public waveIntervalTime = 15;
    private spawnAmountPerWave = 1;

    /**
     * @UndeadSpawnChances
     */
    private readonly TIER_2_MAX_CHANCE = 0.8;
    private readonly TIER_3_MAX_CHANCE = 0.6;
    //These should be the base values for the most spawned unit
    //55% base chance on final night to see Tier 2 units
    private baseTier2Chance = 0.15;
    //Determines how much to increase the tier 2 chance every time tier 2 is not selected
    private tier2ChanceModifier = 0.02;
    private currentTier2Chance = 0.15;
    //25% base chance to see Tier 3 units on final night
    private baseTier3Chance = 0.05;
    //Determines how much to increase the tier 3 chance every time tier 3 is not selected
    private tier3ChanceModifier = 0.01;
    private currentTier3Chance = 0;
    /**
     * @unit_comp_distribution
     * how many of each type of unit are we going to choose?
     */
    private unitCompData = new Map<UnitCategory, number>([
        ["infantry", 1],
        ["missile", 1],
        ["caster", 1],
        ["siege", 1],
        ["hero", 1],
    ]);
    private greatestUnitCountFromAllUnitCategories = 1;
    private units: Unit[] = [];
    public waveTimer: Timer | undefined;
    public currentAttackTarget: Unit | undefined;
    private trig_chooseNextTarget: Trigger | undefined;
    private lastCreatedWaveUnits: Unit[] = [];
    private spawnBoss: boolean = false;
    //Special Effects and Icons
    private spawnIcon: minimapicon | undefined;
    private currentTargetSpecialEffect: Effect | undefined;
    private currentTargetMinimapIcon: minimapicon | undefined;
    private spawnPortalDisplay: Unit | undefined;
    private preSpawnFunctions: ((...args: any) => void)[] = [];
    private onCleanupFunctions: ((...args: any) => void)[] = [];
    private pathFinderAttackPoint: Point | undefined;
    private spawnUnitCount: number = 0;
    private waveIntervalSeconds = 10;
    private defaultSpawnTargetX = 0;
    private defaultSpawnTargetY = 0;
    private spawnOwner: MapPlayer = Players[0];

    /**
     * Used to adjust the difficulty of the night
     */
    private playersPlaying: number = 0;

    /**
     * Tracks how many waves have already been sent to the players from this spawn.
     *
     * Allows for certain things to happen after a certain number of waves being sent.
     */
    private wavesCreated: number = 0;

    constructor(spawn: rect, hideUI: boolean = false, spawnBoss: boolean = false) {
        this.hideUI = hideUI;
        this.spawnBoss = spawnBoss;

        forEachPlayer((p) => {
            if (p.isPlayerAlly(Players[0]) && isPlayingUser(p)) {
                this.playersPlaying++;
            }
        });

        this.spawnRec = Rectangle.fromHandle(spawn);

        const difficulty = Math.floor(Math.random() * 2);
        //its currently 50/50 chance for hard or normal spawns
        const isHardDiff = difficulty === SpawnDifficulty.hard;
        this.spawnDifficulty = difficulty;

        this.waveIntervalTime = waveIntervalOptions[difficulty];

        //Maybe would use?
        this.spawnAmountPerWave = calcBaseAmountPerWave();
        // this.baseTier2Chance = 0.08 + 0.04 * RoundManager.currentRound + (isHardDiff ? 0.08 : 0);
        // this.currentTier2Chance = this.baseTier2Chance;
        // this.baseTier3Chance = 0.05 + 0.02 * RoundManager.currentRound + (isHardDiff ? 0.05 : 0);
        // this.currentTier3Chance = this.baseTier3Chance;

        if (this.spawnDifficulty === SpawnDifficulty.normal) {
            this.currentTier2Chance = -1;
            this.currentTier3Chance = -1;
            this.baseTier2Chance = -1;
            this.baseTier3Chance = -1;
            this.tier2ChanceModifier = 0;
            this.tier3ChanceModifier = 0;
        }

        this.unitCompData = new Map<UnitCategory, number>([
            ["infantry", Math.ceil(0.775 * this.spawnAmountPerWave)],
            ["missile", Math.ceil(0.108 * this.spawnAmountPerWave)],
            ["caster", Math.ceil(0.108 * this.spawnAmountPerWave)],
            ["siege", Math.ceil(0.025 * this.spawnAmountPerWave)],
            // ["hero", Math.ceil(0.015 * this.spawnAmountPerWave)],
        ]);

        /**
         * @todo needs to be calculated in the future
         */
        this.greatestUnitCountFromAllUnitCategories = Math.ceil(0.775 * this.spawnAmountPerWave);
        const { red, green, blue } = this.getMinimapRGB();
        this.spawnIcon = CreateMinimapIcon(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0, red, green, blue, "UI\\Minimap\\MiniMap-Boss.mdl", FOG_OF_WAR_FOGGED);

        // this.spawnPortalDisplay = Unit.create(Players[15], UNITS.undeadSpawn, this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0, 305);
    }

    private getMinimapRGB() {
        switch (this.spawnDifficulty) {
            case SpawnDifficulty.normal:
                return { red: 255, green: 255, blue: 255 };
            case SpawnDifficulty.hard:
                return { red: 255, green: 255, blue: 0 };
            case SpawnDifficulty.boss:
                return { red: 255, green: 105, blue: 0 };
            case SpawnDifficulty.final:
                return { red: 255, green: 0, blue: 0 };
            default:
                return { red: 255, green: 0, blue: 0 };
        }
    }

    private trig_removeDeadUnitFromSpawnCount() {
        const t = Trigger.create();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.addAction(() => {
            const u = Unit.fromEvent();

            if (u && !u.owner.isPlayerAlly(Players[0])) {
                currentZombieCount--;
            }
        });
    }

    public startSpawning() {
        this.preSpawnFunctions.forEach((fn) => fn());
        this.createWaveUnits();
        this.orderNewAttack(this.units);

        const t = Trigger.create();
        this.trig_chooseNextTarget = t;

        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CHANGE_OWNER);

        t.addCondition(() => {
            const u = Unit.fromEvent();

            if (u && u === this.currentAttackTarget) {
                this.orderNewAttack(this.units);
            }

            return false;
        });

        this.waveTimer = Timer.create();

        this.waveTimer.start(this.waveIntervalSeconds, true, () => {
            this.createWaveUnits();
            this.orderNewAttack(this.lastCreatedWaveUnits);
        });
    }

    public cleanupSpawn() {
        this.units.forEach((u, index) => {
            if (u) {
                u.kill();
            }
        });

        this.units.forEach((u) => u.issueOrderAt(OrderId.Attack, this.defaultSpawnTargetX, this.defaultSpawnTargetY));

        if (this.spawnIcon) {
            DestroyMinimapIcon(this.spawnIcon);
        }

        if (this.currentTargetMinimapIcon) {
            DestroyMinimapIcon(this.currentTargetMinimapIcon);
        }

        if (this.currentTargetSpecialEffect) {
            this.currentTargetSpecialEffect.destroy();
        }

        if (this.waveTimer) {
            this.waveTimer.destroy();
        }

        if (this.trig_chooseNextTarget) {
            this.trig_chooseNextTarget.destroy();
        }

        this.spawnPortalDisplay?.destroy();
        isUndeadHeroSoundAlreadyPlaying = false;
        this.onCleanupFunctions.forEach((cb) => {
            cb();
        });
    }

    /**
     * units will firstly use the path finder's location to get an initial target, then they will attack the true target, this will help with pathing
     * @param attackingUnits
     */
    private orderNewAttack(attackingUnits: Unit[]) {
        const newTarget = this.chooseForceAttackTarget(Point.create(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0));

        if (newTarget && newTarget !== this.currentAttackTarget) {
            this.applyAttackTargetEffects(newTarget);
        }

        this.currentAttackTarget = newTarget;

        if (attackingUnits.length > 0) {
            attackingUnits.forEach((u) => {
                if (!this.currentAttackTarget?.isAlive()) {
                    u.issueOrderAt(OrderId.Attack, this.defaultSpawnTargetX, this.defaultSpawnTargetY);
                } else {
                    u.issueOrderAt(OrderId.Attack, this.currentAttackTarget?.x ?? this.defaultSpawnTargetX, this.currentAttackTarget?.y ?? this.defaultSpawnTargetY);
                }
            });
        }

        //If there are any idle units, then make them attack the current target or 0,0
        if (this.units.length > 0) {
            this.units.forEach((u) => {
                if (u.currentOrder === 0 || u.currentOrder === OrderId.Stop || u.currentOrder === OrderId.Holdposition) {
                    if (!this.currentAttackTarget?.isAlive()) {
                        u.issueOrderAt(OrderId.Attack, this.defaultSpawnTargetX, this.defaultSpawnTargetY);
                    } else {
                        u.issueOrderAt(OrderId.Attack, this.currentAttackTarget?.x ?? this.defaultSpawnTargetX, this.currentAttackTarget?.y ?? this.defaultSpawnTargetY);
                    }
                }
            });
        }
    }

    public applyAttackTargetEffects(target: Unit) {
        //Creates an effect at the target attack point for player to see where the next attack location is
        const effect = Effect.create("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", target.x, target.y);

        if (effect) {
            effect.scale = 3;
            effect.setColor(255, 255, 255);
        }

        //destroy the old effect
        if (this.currentTargetSpecialEffect) {
            this.currentTargetSpecialEffect.destroy();
        }

        this.currentTargetSpecialEffect = effect;

        const icon = CreateMinimapIcon(target.x, target.y, 255, 100, 50, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);
        if (this.currentTargetMinimapIcon) {
            DestroyMinimapIcon(this.currentTargetMinimapIcon);
        }

        this.currentTargetMinimapIcon = icon;
    }

    public createWaveUnits() {
        this.wavesCreated++;

        const unitsCreatedThisWave: Unit[] = [];

        //sample a random theta from 0 - PI/2
        //sin(theta) is uniformly distributed with a linear rate of change and valid for chance selection. each point on the curve is equally likely to be chosen as any other
        this.unitCompData.forEach((count, category) => {
            for (let x = 0; x < count; x++) {
                //Range [0, PI/2)
                const randomTheta = (Math.random() * Math.PI) / 2;
                //Range [0, 1)
                const sampledValue = Math.sin(randomTheta);

                //will always spawn tier 3 units on the last 2 nights
                if (this.spawnDifficulty === SpawnDifficulty.final || (this.spawnDifficulty >= SpawnDifficulty.hard && sampledValue <= this.currentTier3Chance)) {
                    //spawn tier 3 unit
                    const u = this.spawnSingleUnit(category, 2);
                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }
                    this.currentTier3Chance = this.baseTier3Chance;
                } else if (this.spawnDifficulty === SpawnDifficulty.boss || sampledValue <= this.currentTier2Chance) {
                    //For boss spawns, the weakest enemy type will be tier 2 and higher

                    //Tier 3 was not selected, so we must increase the chance to be chosen
                    this.currentTier3Chance += this.tier3ChanceModifier;

                    //spawn tier 2 unit
                    const u = this.spawnSingleUnit(category, 1);

                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }

                    this.currentTier2Chance = this.baseTier3Chance;
                } else {
                    //Tier 2 was not selected, so we must increase the chance to be chosen
                    this.currentTier2Chance += this.tier2ChanceModifier;

                    //spawn a tier 1 unit
                    const u = this.spawnSingleUnit(category, 0);

                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }
                }
            }

            this.lastCreatedWaveUnits = unitsCreatedThisWave;
        });
    }

    private spawnSingleUnit(category: UnitCategory, tier: number) {
        if (currentZombieCount >= MAX_ZOMBIE_COUNT) {
            return undefined;
        }

        let unitTypeId = 0;

        const categoryData = unitCategoryData.get(category);

        if (categoryData) {
            switch (tier) {
                case 0:
                    const r1 = Math.floor(Math.random() * categoryData.tierI.length);
                    unitTypeId = categoryData.tierI[r1];
                    break;
                case 1:
                    const r2 = Math.floor(Math.random() * categoryData.tierII.length);
                    unitTypeId = categoryData.tierII[r2];
                    break;
                case 2:
                    const r3 = Math.floor(Math.random() * categoryData.tierIII.length);
                    unitTypeId = categoryData.tierIII[r3];

                    break;
                default:
                    print("Failed to pick zombie from a valid tier!");
                    break;
            }
        }

        if (!unitTypeId) {
            return undefined;
        }

        const u = Unit.create(getNextUndeadPlayer(), unitTypeId, this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0);

        if (u) {
            this.spawnUnitCount;

            this.scaleUnitDifficulty(u);
            u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_BASE, 25);
            u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_NUMBER_OF_DICE, 1);
            u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_SIDES_PER_DIE, 2);

            // if (GameConfig.useEnemyBounty) {
            //     const playerCountModifier = this.playersPlaying - GameConfig.playersRequiredBeforeScaling;
            //     const enemyBountyAmount =
            //         GameConfig.enemyBaseBounty + playerCountModifier * GameConfig.enemyBountyPlayerCountModifier + GameConfig.enemyBountyRoundCountModifier * RoundManager.currentRound + GameConfig.enemyBountySpawnDifficulty * this.spawnDifficulty;

            //     u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_BASE, enemyBountyAmount);
            //     u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_NUMBER_OF_DICE, 1);
            //     u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_SIDES_PER_DIE, 2);
            // }

            this.units.push(u);

            return u;
        }
    }

    /**
     * Increases the health and damage of the unit based on the number of players present when the round started and also the current round the players are on
     * @param unit
     * @returns
     */
    private scaleUnitDifficulty(unit: Unit): Unit {
        // if (GameConfig.enableEnemyScaling && this.playersPlaying > GameConfig.playersRequiredBeforeScaling) {
        //     const playerBonus = this.playersPlaying - 2;
        //     //linear damage increase - will now scale by players, round and current spawn difficulty

        //     //10+20+4>>36+18 Heavy damage scaling
        //     const roundDamageMultiplier =
        //         GameConfig.enemyDMG_baseIncreasePercentage +
        //         GameConfig.enemyDMG_playerCountPercentageMultiplier * playerBonus +
        //         (RoundManager.currentRound * GameConfig.enemyDMG_RoundCountMultiplier + this.spawnDifficulty * GameConfig.enemyDMG_SpawnDifficultyMultiplier) / 100;
        //     const healthBonusMultiplier =
        //         GameConfig.enemyHP_baseIncreasePercentage +
        //         GameConfig.enemyHP_playerCountPercentageMultiplier * playerBonus +
        //         (RoundManager.currentRound * GameConfig.enemyHP_RoundCountMultiplier + this.spawnDifficulty * GameConfig.enemyHP_SpawnDifficultyMultiplier) / 100;

        //     //Increasing health and damage based on number of players playing
        //     const baseDmgIncrease = unit.getBaseDamage(0) + Math.ceil(unit.getBaseDamage(0) * roundDamageMultiplier);
        //     const diceSidesIncrease = unit.getDiceSides(0) + Math.ceil(unit.getDiceSides(0) * roundDamageMultiplier);
        //     const healthIncrease = Math.ceil(unit.maxLife * (1 + healthBonusMultiplier));
        //     unit.name += ` |cff00ff00+${(healthBonusMultiplier * 100).toFixed(0)}%/|cffff0000+${(roundDamageMultiplier * 100).toFixed(0)}%`;
        //     unit.maxLife = healthIncrease;
        //     unit.life = unit.maxLife;
        //     unit.setBaseDamage(baseDmgIncrease, 0);
        //     unit.setDiceSides(diceSidesIncrease, 0);
        // }

        return unit;
    }

    /**
     * Zombies at different spawn points will have different areas they to attack.
     * Should select points of interest that are closest to their spawn.
     * Perhaps some nights they will attack the outskirts
     * Other nights they will attack towards the capital city
     * and on dangerous nights they will attempt to bee line it to the capital city. (?lol probably not fun for the player)
     *
     * We choose the next point of attack relative to the current point
     */
    public chooseForceAttackTarget(currentPoint: Point): Unit | undefined {
        //So we want to iterate our towns.
        /**
         * @WARNING
         * @REFACTOR
         * this should be choosing a new target from the last target not the spawning point
         */
        let shortestDistance = 999999;

        let closestCapturableStructure: Unit | undefined = undefined;

        const currLoc = Location(currentPoint.x, currentPoint.y);

        //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
        primaryCaptureTargets.forEach((unitTypeId) => {
            forEachPlayer((p) => {
                if (p.isPlayerAlly(Players[0])) {
                    forEachUnitTypeOfPlayer(unitTypeId, p, (u) => {
                        if (u && u.isAlive()) {
                            closestCapturableStructure = u;
                        }

                        //Dont check neutral units
                        const locU = Location(u.x, u.y);
                        const dist = DistanceBetweenPoints(currLoc, locU);

                        // //Choose the point closest to the current attack point
                        if (dist < shortestDistance) {
                            shortestDistance = dist;
                            closestCapturableStructure = u;
                        }
                    });
                }
            });
        });

        if (closestCapturableStructure === undefined) {
            print("Unable to find next undead attack target.");
        }

        return closestCapturableStructure;

        //If there exists valid attack points in the scanned region, of the valid points, select the closest. Then proceed
    }
}

const unitCategoryData = new Map<UnitCategory, { tierI: number[]; tierII: number[]; tierIII: number[] }>([
    [
        "infantry",
        {
            tierI: [
                // FourCC("u00J"),

                // UNITS.zombie,
                // UNITS.skeletalOrc,
                //mini overlord
                FourCC("nfgu"),
                //giant skeletal warrior
                FourCC("nsgk"),
                //ghouls
                FourCC("ugho"),
                //
            ],
            tierII: [
                // FourCC("u00J"),

                // UNITS.skeletalOrcChampion,
                // UNITS.fleshBeetle,
                //overlord
                FourCC("nfov"),
            ],
            tierIII: [
                // UNITS.abomination,
                //siege golem
                FourCC("nsgg"),
                //infernal
                FourCC("ninf"),
                //doom guard
                FourCC("nbal"),
                //satyr hell caller
                FourCC("nsth"),
                //sea giant behemoth
                // FourCC("nsgb"),
                // abomination
                // Corrupted Protector
                FourCC("u00J"),
                // UNITS.boss_pitLord,
            ],
        },
    ],
    [
        "missile",
        {
            tierI: [
                // UNITS.skeletalArcher,
                //ice troll
                FourCC("nitr"),
                //void walker
                FourCC("nska"),
                //void walker
                // FourCC("nvdw"),
                //basic skeleton marksman?
            ],
            tierII: [
                //crypt fiends - maybe they can create eggs which hatch and spawn some spiderlings?
                FourCC("ucry"),
                //fire archer
                FourCC("nskf"),
                //garg
                FourCC("ugar"),
            ],
            tierIII: [
                //nether drake - to fucking op lol
                FourCC("nndr"),
                //frost wyrm
                FourCC("ufro"),
                //
            ],
        },
    ],
    [
        "caster",
        {
            tierI: [
                // UNITS.skeletalFrostMage,
                // UNITS.obsidianStatue,
                //kobold geomancer
                FourCC("nkog"),
                //poison treant
                FourCC("nenp"),
                //skeletal frost mage
                //obsidian statue
            ],
            tierII: [
                // UNITS.lich,
                // UNITS.necromancer,
                //stormreaver necrolyte
                FourCC("nsrn"),
                //eredar diabolist
                FourCC("nerd"),

                // UNITS.greaterObsidianStatue,
                //necromancer
                //lich
                //greater obsidian statue
            ],
            tierIII: [
                //eredar warlock
                FourCC("nerw"),
                //queen of suffering
                FourCC("ndqs"),
                //thudner lizzard
                FourCC("nstw"),
                //
            ],
        },
    ],
    [
        "siege",
        {
            tierI: [
                // UNITS.meatWagon,
                //meat wagon
            ],
            tierII: [
                //
                FourCC("ocat"),
            ],
            tierIII: [
                // UNITS.blackCitadelMeatWagon,
                //demon fire artillery
            ],
        },
    ],
    [
        "hero",
        {
            //dread lord
            tierI: [
                //
                // UNITS.zombie,

                FourCC("Udre"),
            ],
            //crypt lord
            tierII: [
                //
                // UNITS.zombie,

                FourCC("Ucrl"),
            ],
            tierIII: [
                //
                // UNITS.zombie,
                FourCC("Ucrl"),

                // UNITS.boss_pitLord,
            ],
        },
    ],
]);

/**
 * Based on the current night, the total number of spawns there will be that night and our max limit on undead units at any given time, and also the number of players playing, we will determine the quantity to spawn.
 * @param totalSpawns
 * @returns
 */
function calcBaseAmountPerWave() {
    let numPlayers = 0;

    forEachAlliedPlayer(() => {
        numPlayers++;
    });

    // const enemiesPerWave = RoundManager.currentRound * 1 + 8 + 1 * numPlayers;
    return 10;
}

//Optional set for doing specific things when a specific unit type spawns; like if a special hero spawns you do something cool? or something
const unitTypeSpawnFunctions = new Map<number, () => void>([
    [
        FourCC("hfoo"),
        () => {
            print("Special abom function!");
        },
    ],
]);

// const undeadHeroAbilityMap = new Map([
//     [UNITS.uh_cryptLord, [FourCC("AUim"), FourCC("AUts"), FourCC("AUcb"), FourCC("AUls")]],
//     [UNITS.uh_deathKnight, [FourCC("AUdc"), FourCC("AUdp"), FourCC("AUau"), FourCC("AUan")]],
//     [UNITS.uh_dreadLord, [FourCC("AUav"), FourCC("AUsl"), FourCC("AUcs"), FourCC("AUin")]],
//     [UNITS.uh_lich, [FourCC("AUfn"), FourCC("AUfu"), FourCC("AUdr"), FourCC("AUdd")]],
// ]);

// /**
//  * Undead heroes will be given random items;
//  */
// const possibleUndeadItems = [
//     ITEMS.demonsEyeTrinket,
//     ITEMS.staffOfPrimalThunder,
//     ITEMS.shieldOfTheGuardian,
//     ITEMS.alaricsSpearOfThunder,
//     ITEMS.swordMastersBlade,
//     ITEMS.berserkersCleaver,
//     ITEMS.amuletOfTheSentinel,
//     ITEMS.bloodRitualPendant,
//     ITEMS.crownOfReanimation_lvl3,
// ];
