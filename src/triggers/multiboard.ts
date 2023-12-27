import { ptColor } from "src/utils/misc";
import { forEachPlayer, isUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Multiboard, MultiboardItem } from "w3ts";

let killCountMultiboard: Multiboard | undefined = undefined;

export enum MultiboardColumnIndexMap {
    PlayerName,
    PlayerTier,
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
export const multiboardData: any[][] = [];

export function setup_multiBoard() {
    delayedTimer(1, () => {
        killCountMultiboard = Multiboard.create();

        if (!killCountMultiboard) {
            print("Unable to create multiboard!");
            return;
        }

        //Initialization for settings
        killCountMultiboard.title = "Player Info";
        killCountMultiboard.rows = 1;
        killCountMultiboard.columns = 4;
        // killCountMultiboard.setItemsWidth(0.15);
        killCountMultiboard.setItemsStyle(true, false);
        killCountMultiboard.display(true);
        killCountMultiboard.minimize(false);

        //Column Headers
        const playerNameColumnItem = killCountMultiboard?.createItem(1, 1);
        playerNameColumnItem?.setValue(`Player`);
        playerNameColumnItem?.setStyle(true, false);
        playerNameColumnItem?.setWidth(0.2);

        const tierLevelColumnItem = killCountMultiboard?.createItem(1, 2);
        tierLevelColumnItem?.setValue(`Tier`);
        tierLevelColumnItem?.setStyle(true, false);
        tierLevelColumnItem?.setWidth(0.05);

        const killCountColumnItem = killCountMultiboard?.createItem(1, 3);
        killCountColumnItem?.setValue(`Kills`);
        killCountColumnItem?.setStyle(true, false);
        killCountColumnItem?.setWidth(0.05);

        const mineCountColumnItem = killCountMultiboard?.createItem(1, 4);
        mineCountColumnItem?.setValue(`Mines`);
        mineCountColumnItem?.setStyle(true, false);
        mineCountColumnItem?.setWidth(0.05);

        //Should create add the player to multiboard, even if they are not playing
        forEachPlayer((p) => {
            if (isUser(p) && killCountMultiboard) {
                killCountMultiboard.rows = killCountMultiboard.rows + 1;

                /**
                 * @note we offset the rows by 2; row 0 isn't valid for multboards and row 1 is reserved for column headers
                 */
                const playerNameItem = killCountMultiboard?.createItem(p.id + 2, 1);
                playerNameItem?.setValue(`${ptColor(p, p.name)}`);
                playerNameItem?.setIcon(`ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn.blp`);
                playerNameItem?.setStyle(true, true);
                playerNameItem?.setWidth(0.2);

                const tierLevelItem = killCountMultiboard.createItem(p.id + 2, 2);
                tierLevelItem?.setIcon(`ReplaceableTextures\\CommandButtons\\BTNStrengthOfTheWild.blp`);
                tierLevelItem?.setValue("1");
                tierLevelItem?.setStyle(true, true);
                tierLevelItem?.setWidth(0.05);

                const killCountItem = killCountMultiboard.createItem(p.id + 2, 3);
                killCountItem?.setIcon(`ReplaceableTextures\\CommandButtons\\BTNCorpseExplode.blp`);
                killCountItem?.setValue("0");
                killCountItem?.setStyle(true, true);
                killCountItem?.setWidth(0.05);

                const mineCountItem = killCountMultiboard.createItem(p.id + 2, 4);
                mineCountItem?.setIcon(`ReplaceableTextures\\CommandButtons\\BTNGoldMine.blp`);
                mineCountItem?.setValue("0");
                mineCountItem?.setStyle(true, true);
                mineCountItem?.setWidth(0.05);

                //Initializing multiboard items for the player
                multiboardItems.push([playerNameItem, tierLevelItem, killCountItem, mineCountItem]);
                multiboardData.push([`${ptColor(p, p.name)}`, 1, 0, 0]);
            }
        });
    });
}

export function adjustMultiboardItemValue(row: number, column: number, value: number) {
    const currentDataValue = multiboardData[row][column];

    if (row > multiboardData.length - 1) {
        print("Index is out of bounds for multiboard data array. Index: ", row);
        return;
    }

    const newDataValue = value + currentDataValue;

    setMultiboardItemValue(row, column, newDataValue);
}

/**
 *  0 indexed array of item arrays
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
    multiboardData[row][column] = value;
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
