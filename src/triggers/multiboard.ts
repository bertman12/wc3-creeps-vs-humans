import { UNITS } from "src/shared/enums";
import { ptColor } from "src/utils/misc";
import { forEachPlayer, isUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Multiboard, MultiboardItem, Trigger, Unit } from "w3ts";

let killCountMultiboard: Multiboard | undefined = undefined;

// /**
//  * Initially items are undefined
//  */
// const multiboardItems = new Map<number, MultiboardItem | undefined>([
//     [0, undefined],
//     [1, undefined],
//     [2, undefined],
//     [3, undefined],
//     [4, undefined],
//     [5, undefined],
// ]);

// const playerKills = new Map<number, number>([
//     [0, 0],
//     [1, 0],
//     [2, 0],
//     [3, 0],
//     [4, 0],
//     [5, 0],
// ]);

enum ColumnIndexMap {
    PlayerName,
    PlayerKills,
    PlayerMines,
}

export class MultiboardUtility extends Multiboard {
    public multiboard: Multiboard | undefined;

    constructor(multiboard: Multiboard) {
        super();
        this.multiboard = multiboard;
    }
}

/**
 * Player indexed array of multiboard items. Each element corresponds to the ColumnIndexMap
 */
const multiboardItems: (MultiboardItem | undefined)[][] = [];
/**
 * Player indexed array of multiboard item values. Each element corresponds to the ColumnIndexMap
 */
const multiboardData: any[][] = [];

export function setup_multiBoard() {
    delayedTimer(1, () => {
        killCountMultiboard = Multiboard.create();

        if (!killCountMultiboard) {
            print("Unable to create multiboard!");
            return;
        }

        killCountMultiboard.title = "Player Info";
        killCountMultiboard.rows = 1;
        killCountMultiboard.columns = 3;
        killCountMultiboard.setItemsWidth(0.15);
        killCountMultiboard.setItemsStyle(true, false);
        killCountMultiboard.display(true);
        killCountMultiboard.minimize(false);

        const playerNameColumnItem = killCountMultiboard?.createItem(1, 1);
        playerNameColumnItem?.setValue(`Player`);
        playerNameColumnItem?.setStyle(true, false);

        const killCountColumnItem = killCountMultiboard?.createItem(1, 2);
        killCountColumnItem?.setValue(`Kills`);
        killCountColumnItem?.setStyle(true, false);

        const mineCountColumnItem = killCountMultiboard?.createItem(1, 3);
        mineCountColumnItem?.setValue(`Mines`);
        mineCountColumnItem?.setStyle(true, false);

        //Should create add the player to multiboard, even if they are not playing
        forEachPlayer((p) => {
            if (isUser(p) && killCountMultiboard) {
                killCountMultiboard.rows = killCountMultiboard.rows + 1;

                /**
                 * @note we offset the rows by 2; row 0 isnt valid for multboards and row 1 is reserved for column headers
                 */

                //Player Names
                const playerNameItem = killCountMultiboard?.createItem(p.id + 2, 1);

                playerNameItem?.setValue(`${ptColor(p, p.name)}`);
                playerNameItem?.setIcon(`ReplaceableTextures\CommandButtons\BTNSelectHeroOn.blp`);
                playerNameItem?.setStyle(true, true);

                const killCountItem = killCountMultiboard.createItem(p.id + 2, 2);
                killCountItem?.setValue("0");
                killCountItem?.setStyle(true, false);

                const mineCountItem = killCountMultiboard.createItem(p.id + 2, 3);
                killCountItem?.setValue("0");
                killCountItem?.setStyle(true, false);

                //Initializing multiboard items for the player
                multiboardItems.push([playerNameItem, killCountItem, mineCountItem]);
                multiboardData.push([`${ptColor(p, p.name)}`, 0, 0]);
                // multiboardItems.set(p.id, playerNameItem);
            }
        });

        trackPlayerKillCount();
    });
}

function trackPlayerKillCount() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addAction(() => {
        const u = Unit.fromEvent();
        const killer = Unit.fromHandle(GetKillingUnit());

        if (!u || !killer) return;

        // const multiboardItem = multiboardItems.get(killer.owner.id);
        // const currentKills = playerKills.get(killer.owner.id);

        // if (multiboardItem !== undefined && currentKills !== undefined) {
        //     multiboardItem.setValue(`${ptColor(killer.owner, killer.owner.name)}: ${currentKills + 1}`);
        //     playerKills.set(killer.owner.id, currentKills + 1);
        // }
    });
}

export function setHeroIconForPlayerMultiboardItem(hero: Unit) {
    const multiboardItem = multiboardItems[hero.owner.id];
    // const multiboardItem = multiboardItems.get(hero.owner.id);

    if (!multiboardItem) return;

    const iconPath = heroIconsMap.get(hero.typeId);

    if (!iconPath) return;

    // multiboardItem.setIcon(iconPath);
}

/**
 *
 * @param row Player index
 * @param column Column Index Map
 */
export function setMultiboardItemValue(row: number, column: number, value: string) {
    const playerMultiboardItems = multiboardItems[row];

    if (!playerMultiboardItems[column]) {
        print("Could not find multiboard item column number: ", column);
        return;
    }

    playerMultiboardItems[column]?.setValue(value);
}

/**
 *
 * @param row Player index
 * @param column Column Index Map
 */
export function setMultiboardItemIcon(row: number, column: number, iconPath: string) {
    const playerMultiboardItems = multiboardItems[row];

    if (!playerMultiboardItems[column]) {
        print("Could not find multiboard item column number: ", column);
        return;
    }

    playerMultiboardItems[column]?.setIcon(iconPath);
}

const heroIconsMap = new Map<number, string>([
    [UNITS.hero_makuraLord, "ReplaceableTextures\\CommandButtons\\BTNLobstrokkBlue.blp"],
    [UNITS.hero_overlordArachnathid, "ReplaceableTextures\\CommandButtons\\BTNArachnathidpurple.blp"],
    [UNITS.hero_shadowDemon, "ReplaceableTextures\\CommandButtons\\BTNSpiritOfVengeance.blp"],
    [UNITS.hero_centaurKhan, "ReplaceableTextures\\CommandButtons\\BTNCentaurKhan.blp"],
    [UNITS.hero_skeletalFlameMaster, "ReplaceableTextures\\CommandButtons\\BTNSkeletonArcher.blp"],
    [UNITS.hero_gnollWarden, "ReplaceableTextures\\CommandButtons\\BTNGnollWarden.blp"],
    [UNITS.hero_murlocKing, "ReplaceableTextures\\CommandButtons\\BTNMurlocNightCrawler.blp"],
    [UNITS.hero_revenant, "ReplaceableTextures\\CommandButtons\\BTNRevenant.blp"],
    [UNITS.hero_salamander, "ReplaceableTextures\\CommandButtons\\BTNThunderLizardSalamander.blp"],
    [UNITS.hero_satyr, "ReplaceableTextures\\CommandButtons\\BTNSatyr.blp"],
    [UNITS.hero_spiderBroodMaster, "ReplaceableTextures\\CommandButtons\\BTNnerubianSpiderLord.blp"],
    [UNITS.hero_ursa, "ReplaceableTextures\\CommandButtons\\BTNPolarFurbolgElder.blp"],
]);
