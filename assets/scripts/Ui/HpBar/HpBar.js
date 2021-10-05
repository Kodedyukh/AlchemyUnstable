import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        _hearts: { default: null, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._hearts = [];
        this.node.children.forEach(ch => {
            this._hearts.push(ch);
        });

        this._handleSubscription(true);
    },

    start () {

    },

    // update (dt) {},

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.HP_MINUS, this.onHpMinus, this);
	},

    onHpMinus() {
        if (this._hearts.length) {
            this._hearts.pop().getComponent(cc.Animation).play();

            if (this._hearts.length === 0) {
                cc.systemEvent.emit(GameEvent.GAME_OVER);
            }
        }
    }

});
