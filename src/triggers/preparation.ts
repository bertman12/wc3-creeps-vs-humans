import { GameConfig } from "src/shared/GameConfig";
import { UNITS } from "src/shared/enums";
import { playerStates } from "src/shared/playerState";
import { notifyPlayer, tColor } from "src/utils/misc";
import { forEachAlliedPlayer, forEachPlayer, isPlayingUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { MapPlayer, Rectangle, Region, Timer, Trigger, Unit } from "w3ts";

/**
 * Must occur after player states have been setup
 */
export function setup_heroPurchasing(onPrepTimeEnd: (...args: any[]) => any) {
    delayedTimer(1, () => {
        const prepHeroPurchaseTrigger = trig_heroPurchasedDuringPrepTime();
        const prepTimer = Timer.create();
        const prepTimerDialog = CreateTimerDialogBJ(prepTimer.handle, "Preparation Time...");
        const PREP_TIME_SECONDS = GameConfig.heroPreparationTime;
        notifyPlayer(`You have ${PREP_TIME_SECONDS} seconds to prepare. You may still pick your hero after preparation time has ended.`);
        print(tColor("Choose your hero...", "red"));

        if (!prepTimerDialog) {
            print("Was unable to setup prep timer dialog!");
            //As a backup, just use the normal hero purchase trigger
            trig_heroPurchasedAfterPrepTime();
            return;
        }

        TimerDialogDisplayBJ(true, prepTimerDialog);

        prepTimer.start(PREP_TIME_SECONDS, false, () => {
            prepHeroPurchaseTrigger.destroy();
            TimerDialogDisplayBJ(false, prepTimerDialog);

            notifyPlayer("Preparation time has ended.");
            moveAllPrepHeroesToStartLocationAndGiveItems();
            trig_heroPurchasedAfterPrepTime();
            onPrepTimeEnd();
        });

        //Create hero choosers for player
    });
}

/**
 * This the normal hero spawning trigger which will be activated after 30 seconds
 */
function trig_heroPurchasedAfterPrepTime() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetBuyingUnit());
        if (u && u.typeId === FourCC("nshe")) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const heroPicker = Unit.fromHandle(GetBuyingUnit());
        const purchasedHero = Unit.fromHandle(GetSoldUnit());
        const seller = Unit.fromHandle(GetSellingUnit());

        if (!heroPicker || !purchasedHero || !seller) {
            return;
        }

        heroPicker.kill();

        const playerState = playerStates.get(purchasedHero.owner.id);

        if (playerState) {
            playerState.playerHero = purchasedHero;
        }

        SelectUnitForPlayerSingle(purchasedHero.handle, purchasedHero.owner.handle);
        SelectUnitRemoveForPlayer(seller?.handle, purchasedHero.owner.handle);
        moveSingleHeroToStartLocationAndGiveItems(purchasedHero.owner);
    });
}

/**
 * This will be used for the first 30 seconds of the game, then the match will begin, this trigger will be disabled and the other trigger will be used instead
 */
function trig_heroPurchasedDuringPrepTime() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetBuyingUnit());
        if (u && u.typeId === FourCC("nshe")) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const heroPicker = Unit.fromHandle(GetBuyingUnit());
        const purchasedHero = Unit.fromHandle(GetSoldUnit());
        const seller = Unit.fromHandle(GetSellingUnit());

        if (!heroPicker || !purchasedHero || !seller) {
            return;
        }

        heroPicker.kill();
        const playerState = playerStates.get(purchasedHero.owner.id);

        if (playerState) {
            playerState.playerHero = purchasedHero;
        }

        purchasedHero.addAbility(FourCC("Avul"));

        SelectUnitForPlayerSingle(purchasedHero.handle, purchasedHero.owner.handle);
        SelectUnitRemoveForPlayer(seller?.handle, purchasedHero.owner.handle);
    });

    return t;
}

/**
 * Should happen exactly at the transition when the prep trigger ends and the post prep hero purchase trigger starts
 * Logic can be used inside postPrep hero purchased trigger
 */
function moveAllPrepHeroesToStartLocationAndGiveItems() {
    forEachAlliedPlayer((p) => {
        if (isPlayingUser(p)) {
            moveSingleHeroToStartLocationAndGiveItems(p);
        }
    });
}

/**
 * Player should already have a hero assigned when this is used
 *
 * Will give the hero their starting items and then move to start location as well create the hero army controller
 * @param player
 * @returns
 */
function moveSingleHeroToStartLocationAndGiveItems(player: MapPlayer) {
    if (isPlayingUser(player)) {
        const playerState = playerStates.get(player.id);

        if (playerState) {
            const purchasedHero = playerState.playerHero;

            if (!purchasedHero) {
                return;
            }

            GameConfig.heroStartItems.forEach((itemId) => {
                purchasedHero?.addItemById(itemId);
            });

            //use game config location when set
            const startX = purchasedHero.owner.startLocationX;
            const startY = purchasedHero.owner.startLocationY;

            SetCameraPositionForPlayer(player.handle, startX, startY);
            purchasedHero.x = startX;
            purchasedHero.y = startY;
            purchasedHero.removeAbility(FourCC("Avul"));
        }
    }
}

function createHeroChoosers() {
    const previewRegion = Region.create();
    const previewRectangle = Rectangle.fromHandle(gg_rct_HeroSpawnArea);
    forEachPlayer((p) => {
        if (isPlayingUser(p) && previewRectangle) {
            Unit.create(p, UNITS.heroChooser, previewRectangle.centerX, previewRectangle.centerY);
        }
    });
}