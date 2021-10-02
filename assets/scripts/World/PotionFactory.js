import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

cc.Class({
    extends: InteractionArea,

    properties: {
        potionType: { default: PotionTypes.None, type: PotionTypes },
        _hasPotions: { default: false, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this._hasPotions = this.potionType !== PotionTypes.None;
    },

    // update (dt) {},

    interact(initiator) {
        if (this._hasPotions && !initiator.hasPotion()) {
            initiator.setPotionType(this.potionType);
            initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);
        }
    }
});
