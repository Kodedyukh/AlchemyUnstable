import InteractionArea from 'InteractionArea';

cc.Class({
    extends: InteractionArea,

    properties: {
        potionPrefab: { default: null, type: cc.Prefab },
        hasPotions: { default: false, visible: false }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.hasPotions = this.potionPrefab !== null;
    },

    // update (dt) {},

    interact(initiator) {
        if (this.hasPotions && !initiator.potion) {
            initiator.potion = cc.instantiate(this.potionPrefab);
            initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);
        }
    }
});
