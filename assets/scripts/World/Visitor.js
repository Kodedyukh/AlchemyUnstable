import GameEvent from 'GameEvent';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

cc.Class({
    extends: InteractionArea,

    properties: {
        visitorIndex: 0,
        skeleton: { default: null, type: sp.Skeleton }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._handleSubscription(true);

        this.onEndWalk();
    },

    start () {
    },

    update (dt) {
    },

    onWalkStart() {
        this.skeleton && this.skeleton.setAnimation(0, 'run', true);
    },

    onWalkEnd() {
        this.skeleton && this.skeleton.setAnimation(0, 'idle', true);
    },

    interact(initiator) {
        if (initiator.getPotionType() === PotionTypes.Result) {
            initiator.setPotionType(PotionTypes.None);
            initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);

            cc.systemEvent.emit(GameEvent.ORDER_COMPLITED);
            this._escape();
        } 
    },

    stopInteract(initiator) {
    },

    instantInteract() {
        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients) => { 
            cc.systemEvent.emit(GameEvent.SHOW_BUBBLE, this.node.position, ingridients);
        });
    },

    stopInstantInteract() {
        cc.systemEvent.emit(GameEvent.HIDE_BUBBLE);
    },

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.POTION_WASTED, this.onPotionWasted, this);
	},

    _escape() {
        this.getComponents(cc.PhysicsCollider).forEach(c => {
            this.node.removeComponent(c);
        });

        cc.tween(this.node)
            .to(1, { opacity: 0 })
            .call(() => {
                this.node.active = false;
            })
            .start();
    },

    onPotionWasted() {
        this._escape();
    }
});
