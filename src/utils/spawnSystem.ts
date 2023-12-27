import { ABILITIES, MinimapIconPath, UNITS, UPGRADES, primaryCaptureTargets } from "src/shared/enums";
import { playerStates } from "src/shared/playerState";
import { getPlayerSpawnBuilderRegionMap } from "src/triggers/spawnBuilder";
import { forEachPlayer, forEachUnitInRectangle, forEachUnitTypeOfPlayer, isPlayingUser } from "src/utils/players";
import { Effect, MapPlayer, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { playerRGBMap } from "./color";
import { notifyPlayer, ptColor, tColor } from "./misc";
import { delayedTimer } from "./timer";

//30 seconds being the hard spawn, 15 second intervals being the normal spawn difficulty; maybe fr
let computerPlayerPool: MapPlayer[] = [];

let playerSpawns: SpawnData[] = [];

export function setup_playerCreepSpawns() {
    Players.forEach((p, index) => {
        if (index > 5) {
            computerPlayerPool.push(p);
        }
    });

    forEachPlayer((p) => {
        if (isPlayingUser(p)) {
            const spawnRec = Rectangle.create(p.startLocationX, p.startLocationY, p.startLocationX, p.startLocationY);

            if (spawnRec) {
                const newSpawn = new SpawnData(spawnRec.handle, p, false, false, "simple");
                playerSpawns.push(newSpawn);

                newSpawn.addUnitsInSpawnBuilderRegionToSimplePool();
                newSpawn.startSpawning();
                const playerState = playerStates.get(p.id);

                if (playerState) {
                    playerState.ownedSpawn = newSpawn;
                }

                Unit.create(p, UNITS.itemShop, p.startLocationX - 300, p.startLocationY);
            }
        }
    });

    notifyPlayer(`${tColor("Objective", "goldenrod")} - Kill enemy player bases.`);
}

type UnitCategory = "infantry" | "missile" | "caster" | "siege" | "hero" | "all";

enum SpawnDifficulty {
    normal,
    hard,
    boss,
    final,
}

export class SpawnData {
    public spawnRec: Rectangle | undefined;
    /**
     * Determines whether or not to show effects and minimap icons for the spawn.
     */
    public hideUI: boolean = false;
    //This will determine the wave interval timer, which thus determines units spawned per wave
    public spawnDifficulty = 0;
    //random number from the array;
    private spawnAmountPerWave = 1;
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

    private units: Unit[] = [];
    public waveTimer: Timer | undefined;
    public currentAttackTarget: Unit | undefined;
    private trig_chooseNextTarget: Trigger | undefined;
    private lastCreatedWaveUnits: Unit[] = [];
    //Special Effects and Icons
    private spawnIcon: minimapicon | undefined;
    private currentTargetSpecialEffect: Effect | undefined;
    private currentTargetMinimapIcon: minimapicon | undefined;
    public spawnBase: Unit | undefined;
    private preSpawnFunctions: ((...args: any) => void)[] = [];
    private onCleanupFunctions: ((...args: any) => void)[] = [];
    private spawnUnitCount: number = 0;
    private waveIntervalSeconds = 10;
    private defaultSpawnTargetX = 0;
    private defaultSpawnTargetY = 0;
    public spawnOwner: MapPlayer = Players[0];
    private MAX_SPAWN_COUNT = 110;
    public simpleUnitSpawnPool: Unit[] = [];
    public spawnType: "simple" | "tiered" = "simple";
    /**
     * A pool of players to use when creating units
     * Should be initialized at the start of the game.
     */
    public alliedPlayerPool: MapPlayer[] = [];
    /**
     * Used to adjust the difficulty of the night
     */
    private playersPlaying: number = 0;
    private retainCurrentAttackTarget: boolean = false;
    /**
     * Tracks how many waves have already been sent to the players from this spawn.
     *
     * Allows for certain things to happen after a certain number of waves being sent.
     */
    private wavesCreated: number = 0;
    private lastUsedPlayerIndex = 0;

    constructor(spawn: rect, owner: MapPlayer, hideUI: boolean = false, spawnBoss: boolean = false, spawnType: "simple" | "tiered") {
        this.hideUI = hideUI;
        this.spawnOwner = owner;
        this.spawnType = spawnType;
        this.spawnRec = Rectangle.fromHandle(spawn);

        //Maybe would use?
        this.spawnAmountPerWave = this.calculateUnitCountSpawnedPerWave();

        this.unitCompData = new Map<UnitCategory, number>([
            ["infantry", Math.ceil(1 * this.spawnAmountPerWave)],
            ["missile", Math.ceil(0.108 * this.spawnAmountPerWave)],
            ["caster", Math.ceil(0.108 * this.spawnAmountPerWave)],
            ["siege", Math.ceil(0.025 * this.spawnAmountPerWave)],
        ]);

        this.spawnIcon = CreateMinimapIcon(
            this.spawnRec?.centerX ?? 0,
            this.spawnRec?.centerY ?? 0,
            playerRGBMap.get(this.spawnOwner.id)?.r ?? 0,
            playerRGBMap.get(this.spawnOwner.id)?.g ?? 0,
            playerRGBMap.get(this.spawnOwner.id)?.b ?? 0,
            "UI\\Minimap\\MiniMap-Boss.mdl",
            FOG_OF_WAR_FOGGED
        );

        this.spawnBase = Unit.create(this.spawnOwner, FourCC("h000"), this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0, 305);

        if (this.spawnBase) {
            const playerState = playerStates.get(this.spawnOwner.id);
            this.spawnBase.startAbilityCooldown(ABILITIES.playerBase_summonInfernal, 120);

            if (playerState) {
                playerState.setup_defeatPlayer(this.spawnBase);
                playerState.setup_grantBaseIncome(this.spawnBase);
            }
        }

        this.setup_removeDeadUnitFromSpawnCount();

        //Setup allied player spawn pool
        //Iterate through the spawn pool and check to see if that player is already in another player's spawn pool, if not then add it to our until we reach 3 players in our pool
        computerPlayerPool.forEach((comp) => {
            //Should also check the owner is different from this spawn
            const alreadyUsed = playerSpawns.find((spawn) => spawn.alliedPlayerPool.find((p) => p === comp));

            //Add to our pool if its no used yet
            if (!alreadyUsed && this.alliedPlayerPool.length < 3) {
                this.alliedPlayerPool.push(comp);
            }
        });

        this.alliedPlayerPool.forEach((comp) => {
            SetPlayerAllianceStateAllyBJ(this.spawnOwner.handle, comp.handle, true);
            SetPlayerAllianceStateAllyBJ(comp.handle, this.spawnOwner.handle, true);
            //Colorize computer name to match the player's
            comp.name = ptColor(this.spawnOwner, this.spawnOwner.name);

            this.spawnOwner.setAlliance(comp, ALLIANCE_SHARED_VISION, true);
            comp.setAlliance(this.spawnOwner, ALLIANCE_SHARED_VISION, true);

            this.alliedPlayerPool.forEach((p) => {
                if (p !== comp) {
                    SetPlayerAllianceStateAllyBJ(p.handle, comp.handle, true);
                    SetPlayerAllianceStateAllyBJ(comp.handle, p.handle, true);
                    p.setAlliance(comp, ALLIANCE_SHARED_VISION, true);
                    comp.setAlliance(p, ALLIANCE_SHARED_VISION, true);
                }
            });
        });
        this.trackPlayerUsesCreepControl();
    }

    /**
     * Runs after spawn is constructed
     */
    public addUnitsInSpawnBuilderRegionToSimplePool() {
        const regionMap = getPlayerSpawnBuilderRegionMap();
        const playerSpawnBuilderRegion = regionMap.get(this.spawnOwner.id);

        if (!playerSpawnBuilderRegion) return;
        //Clears spawn pool
        this.simpleUnitSpawnPool = [];
        const illegalUnits = [UNITS.spawnBuilder_tier1, UNITS.upgradeShop, FourCC("efon")];
        forEachUnitInRectangle(playerSpawnBuilderRegion, (u) => {
            if (!illegalUnits.includes(u.typeId) && !u.isHero()) {
                this.simpleUnitSpawnPool.push(u);
            }
        });
    }

    private trackPlayerUsesCreepControl() {
        const t = Trigger.create();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
        t.addAction(() => {
            const spellId = GetSpellAbilityId();
            const x = GetSpellTargetX();
            const y = GetSpellTargetY();

            if (spellId === ABILITIES.creepControl) {
                print("Player used creep control.");
                print(`Spell x and y`, x, " ", y);

                this.chooseForceAttackTarget(Point.create(x, y), true);
                this.orderNewAttack(this.units, true);
                // this.retainCurrentAttackTarget = true;

                const upgradeLevel = this.spawnOwner.getTechCount(UPGRADES.improvedCreepControl, true);
                //Should occur after the 6th wave has left for the target.
                delayedTimer(61 + 11 * upgradeLevel, () => {
                    this.retainCurrentAttackTarget = false;
                });
            }
        });
    }

    private calculateUnitCountSpawnedPerWave() {
        return 3;
    }

    private getNextAlliedComputerPlayer() {
        let player = this.alliedPlayerPool[this.lastUsedPlayerIndex];

        if (this.lastUsedPlayerIndex >= this.alliedPlayerPool.length) {
            this.lastUsedPlayerIndex = 0;
            player = this.alliedPlayerPool[this.lastUsedPlayerIndex];
        } else {
            this.lastUsedPlayerIndex++;
        }

        return player;
    }

    private setup_removeDeadUnitFromSpawnCount() {
        const t = Trigger.create();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.addAction(() => {
            const u = Unit.fromEvent();
            //Summonable units - wards?
            const invalidUnits = [UNITS.summon_spiritPig, UNITS.summon_treant, UNITS.healingWard];
            if (u && !u.owner.isPlayerAlly(Players[0])) {
                this.spawnUnitCount--;
            }
        });
    }

    public startSpawning() {
        this.preSpawnFunctions.forEach((fn) => fn());
        this.createWaveUnits();
        this.orderNewAttack(this.units, false);

        const t = Trigger.create();
        this.trig_chooseNextTarget = t;

        // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CHANGE_OWNER);

        t.addCondition(() => {
            const u = Unit.fromEvent();
            //Doesn't keep track of a previous target that a previous spawn was attacking only the most recent one, thats why it fails.
            //Condition will fail for past spawns because the current target is no longer the same
            if (u && u === this.currentAttackTarget) {
                this.orderNewAttack(this.units, false);
            }

            return false;
        });

        this.waveTimer = Timer.create();

        this.waveTimer.start(this.waveIntervalSeconds, true, () => {
            this.createWaveUnits();
            this.orderNewAttack(this.lastCreatedWaveUnits, this.retainCurrentAttackTarget);
        });
    }

    public cleanupSpawn() {
        this.units.forEach((u) => {
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

        this.spawnBase?.destroy();

        this.onCleanupFunctions.forEach((cb) => {
            cb();
        });
    }

    /**
     * units will firstly use the path finder's location to get an initial target, then they will attack the true target, this will help with pathing
     * @param attackingUnits
     */
    private orderNewAttack(attackingUnits: Unit[], useCurrentTarget: boolean) {
        const newTarget = useCurrentTarget ? this.currentAttackTarget : this.chooseForceAttackTarget(Point.create(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0));

        if (useCurrentTarget) {
            print("Attack will use current attack target.");
        }

        if (newTarget) {
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

        const icon = CreateMinimapIcon(target.x, target.y, playerRGBMap.get(this.spawnOwner.id)?.r ?? 0, playerRGBMap.get(this.spawnOwner.id)?.g ?? 0, playerRGBMap.get(this.spawnOwner.id)?.b ?? 0, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);
        if (this.currentTargetMinimapIcon) {
            DestroyMinimapIcon(this.currentTargetMinimapIcon);
        }

        this.currentTargetMinimapIcon = icon;
    }

    public createWaveUnits() {
        if (this.spawnType === "simple") {
            this.spawnUnitsSimple();
            return;
        }
    }

    /**
     * Makes use of the simple unit spawn pool instead of the tiered unit configuration
     */
    private spawnUnitsSimple() {
        this.wavesCreated++;

        const unitsCreatedThisWave: Unit[] = [];

        this.simpleUnitSpawnPool.forEach((spawnUnit) => {
            if (this.spawnUnitCount >= this.MAX_SPAWN_COUNT) {
                return undefined;
            }

            const u = Unit.create(this.getNextAlliedComputerPlayer(), spawnUnit.typeId, this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0);

            if (u) {
                this.spawnUnitCount++;
                u.owner.name = ptColor(this.spawnOwner, this.spawnOwner.name);
                u.color = this.spawnOwner.color;

                u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_BASE, 25);
                u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_NUMBER_OF_DICE, 1);
                u.setField(UNIT_IF_GOLD_BOUNTY_AWARDED_SIDES_PER_DIE, 2);

                this.units.push(u);
                unitsCreatedThisWave.push(u);
            }
        });

        this.lastCreatedWaveUnits = unitsCreatedThisWave;
    }

    public chooseForceAttackTarget(currentPoint: Point, relativeToPoint?: boolean): Unit | undefined {
        if (this.retainCurrentAttackTarget && this.currentAttackTarget?.isAlive()) {
            print("Player is using creep control. A new target will not be chosen.");
            return this.currentAttackTarget;
        } else if (this.retainCurrentAttackTarget && !this.currentAttackTarget?.isAlive()) {
            this.retainCurrentAttackTarget = false;
        }

        /**
         * @WARNING
         * @REFACTOR
         * this should be choosing a new target from the last target not the spawning point
         */
        let shortestDistance = 999999;

        let closestCapturableStructure: Unit | undefined = undefined;

        const currLoc = Location(currentPoint.x, currentPoint.y);

        if (!relativeToPoint) {
            //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
            primaryCaptureTargets.forEach((unitTypeId) => {
                forEachPlayer((p) => {
                    if (!p.isPlayerAlly(this.spawnOwner)) {
                        forEachUnitTypeOfPlayer(unitTypeId, p, (u) => {
                            if (u && u.isAlive() && math.random(0, 100) < 25) {
                                closestCapturableStructure = u;
                            }
                        });
                    }
                });
            });
        }

        let previousEffect: Effect | undefined = undefined;

        //Used when random choice fails or when relativeToPoint is true
        if (closestCapturableStructure === undefined) {
            primaryCaptureTargets.forEach((unitTypeId) => {
                forEachPlayer((p) => {
                    if (!p.isPlayerAlly(this.spawnOwner)) {
                        forEachUnitTypeOfPlayer(unitTypeId, p, (u) => {
                            //Dont check neutral units
                            const locU = Location(u.x, u.y);
                            // const dist = DistanceBetweenPoints(currLoc, locU);

                            const distance = Math.sqrt(Math.pow(u.x - currentPoint.x, 2) + Math.pow(u.y - currentPoint.y, 2));

                            // //Choose the point closest to the current attack point

                            if (distance < shortestDistance) {
                                shortestDistance = distance;
                                closestCapturableStructure = u;

                                // previousEffect?.setColor(0, 0, 0);

                                // const rallyFlag = Effect.create("UI\\Feedback\\RallyPoint\\RallyPoint.mdl", u.x, u.y);
                                // rallyFlag?.setScaleMatrix(2, 2, 2);
                                // rallyFlag?.setColorByPlayer(this.spawnOwner);

                                // previousEffect = rallyFlag;

                                // print("Shortest Distance: ", distance);
                            }
                        });
                    }
                });
            });
        }

        closestCapturableStructure = closestCapturableStructure as unknown as Unit;

        // const rallyFlag = Effect.create("UI\\Feedback\\RallyPoint\\RallyPoint.mdl", closestCapturableStructure.x, closestCapturableStructure.y);
        // rallyFlag?.setScaleMatrix(4, 4, 4);
        // rallyFlag?.setColorByPlayer(this.spawnOwner);
        return closestCapturableStructure;

        //If there exists valid attack points in the scanned region, of the valid points, select the closest. Then proceed
    }
}
