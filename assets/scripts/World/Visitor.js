import GameEvent from 'GameEvent';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

cc.Class({
    extends: InteractionArea,

    properties: {
        visitorIndex: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._handleSubscription(true);
    },

    start () {
    },

    update (dt) {
    },

    interact(initiator) {
        if (initiator.getPotionType() === PotionTypes.Result) {
            initiator.setPotionType(PotionTypes.None);
            initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);

            cc.systemEvent.emit(GameEvent.ORDER_COMPLITED);
            this._escape();
        } else {
            cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingredients) => {
                cc.log(ingredients);
            });
        }
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

    // принимает в качестве аргумента функцию обработчик, в которую в свою очередь передается массив
    // элементов в двумя свойствами: potionType (тип данных PotionType) и _isDelivered (тип данных Boolean)
    onPotionWasted() {
        this._escape();
    }
});
