import { ABILITIES, UNITS } from "src/shared/enums";
import { getPlayerState, playerStates } from "src/shared/playerState";
import { adjustGold, adjustLumber, forEachPlayer, isPlayingUser } from "src/utils/players";
import { createUnits } from "src/utils/units";
import { MapPlayer, Rectangle, Trigger, Unit } from "w3ts";

export function createSpawnBuilder() {
    const player1Area = Rectangle.fromHandle(gg_rct_Player1SpawnBuilder);
    const player2Area = Rectangle.fromHandle(gg_rct_Player2SpawnBuilder);
    const player3Area = Rectangle.fromHandle(gg_rct_Player3SpawnBuilder);
    const player4Area = Rectangle.fromHandle(gg_rct_Player4SpawnBuilder);
    const player5Area = Rectangle.fromHandle(gg_rct_Player5SpawnBuilder);
    const player6Area = Rectangle.fromHandle(gg_rct_Player6SpawnBuilder);

    const playerSpawnBuilderMap = new Map<number, Rectangle | undefined>([
        [0, player1Area],
        [1, player2Area],
        [2, player3Area],
        [3, player4Area],
        [4, player5Area],
        [5, player6Area],
    ]);

    forEachPlayer((p) => {
        if (isPlayingUser(p)) {
            const builderRect = playerSpawnBuilderMap.get(p.id);
            if (builderRect) {
                Unit.create(p, UNITS.spawnBuilder_tier1, builderRect.centerX, builderRect.centerY);
                createUnits(3, true, p, UNITS.murloc_baseUnit, builderRect.centerX, builderRect.centerY - 100);
            }
        }
    });

    setup_spawnBuilderTracker();
    removeUnitFromSpawn();
}

export function getPlayerSpawnBuilderRegionMap() {
    const player1Area = Rectangle.fromHandle(gg_rct_Player1SpawnBuilder);
    const player2Area = Rectangle.fromHandle(gg_rct_Player2SpawnBuilder);
    const player3Area = Rectangle.fromHandle(gg_rct_Player3SpawnBuilder);
    const player4Area = Rectangle.fromHandle(gg_rct_Player4SpawnBuilder);
    const player5Area = Rectangle.fromHandle(gg_rct_Player5SpawnBuilder);
    const player6Area = Rectangle.fromHandle(gg_rct_Player6SpawnBuilder);

    const playerSpawnBuilderMap = new Map<number, Rectangle | undefined>([
        [0, player1Area],
        [1, player2Area],
        [2, player3Area],
        [3, player4Area],
        [4, player5Area],
        [5, player6Area],
    ]);

    return playerSpawnBuilderMap;
}

function setup_spawnBuilderTracker() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_FINISH);
    t.addAction(() => {
        const p = MapPlayer.fromEvent();
        const u = Unit.fromEvent();
        if (!p || !u) return;

        const state = playerStates.get(p.id);
        print(`Player ${p.name} built ${u.name}`);
        if (state) {
            state.ownedSpawn?.simpleUnitSpawnPool.push(u);
        }
    });
}

function removeUnitFromSpawn() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addAction(() => {
        const spellNumber = GetSpellAbilityId();
        const caster = Unit.fromHandle(GetSpellAbilityUnit());
        const victim = Unit.fromHandle(GetSpellTargetUnit());
        if (spellNumber === ABILITIES.removeUnitFromSpawn && victim && caster) {
            print("Refunded cost for spawn unit.");
            adjustGold(caster.owner, GetUnitGoldCost(victim.typeId));
            adjustLumber(caster.owner, GetUnitGoldCost(victim.typeId));
            const state = getPlayerState(caster.owner);
            if (!state) {
                return;
            }

            const removalIndex = state.ownedSpawn?.simpleUnitSpawnPool.findIndex((u) => u == victim);

            if (!removalIndex) {
                return;
            }

            print(`Removed ${victim.name} from ${caster.owner.name}'s spawn pool.`);

            state.ownedSpawn?.simpleUnitSpawnPool.splice(removalIndex, 1);
        }
    });
}
