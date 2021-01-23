///<reference path="Item.ts"/>
class EnergyRestore extends Item {

    type: GameConstants.EnergyRestoreSize;

    constructor(type: GameConstants.EnergyRestoreSize, displayName?: string) {
        super(GameConstants.EnergyRestoreSize[type], undefined, undefined, undefined, displayName);
        this.type = type;
    }

    use(): boolean {
        if (player.itemList[this.name]() <= 0) {
            return false;
        }
        if (App.game.underground.energy === App.game.underground.getMaxEnergy()) {
            Notifier.notify({
                message: 'Your mining energy is already full!',
                type: NotificationConstants.NotificationOption.danger,
            });
            return false;
        }
        App.game.underground.gainEnergyThroughItem(this.type);
        player.loseItem(this.name, 1);
        return true;
    }

}

ItemList['SmallRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.SmallRestore,'Small Restore');
ItemList['MediumRestore'] = new EnergyRestore(GameConstants.EnergyRestoreSize.MediumRestore, 'Medium Restore');
ItemList['LargeRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.LargeRestore, 'Large Restore');

ShopEntriesList['Small Restore']  = new ShopItem('Small Restore', ItemList['SmallRestore'], 30000);
ShopEntriesList['Medium Restore'] = new ShopItem('Medium Restore', ItemList['MediumRestore'], 100000);
ShopEntriesList['Large Restore']  = new ShopItem('Large Restore', ItemList['LargeRestore'], 400000);
