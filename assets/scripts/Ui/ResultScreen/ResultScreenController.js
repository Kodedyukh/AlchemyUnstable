import GameEvent  from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        coinCounterNode: { default: null, type: cc.Node },
        positionToMove: { default: cc.v2(), type: cc.Vec2 },
        timeToMove: { default: 3, type: cc.Float },
        timeToVisibility: { default: 3, type: cc.Float }
    },

    onEnable() {
        this.node.opacity = 0;

        this._handleSubscription(true);
    },

    onDisable() {
        this._handleSubscription(false);
    },

    _handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.GAME_OVER, this.onGameOver, this);
    },

    onGameOver() {
        if (this.coinCounterNode) {
            cc.tween(this.coinCounterNode)
                .to(this.timeToMove, {position: this.positionToMove}, {easing: 'sineIn'})
                .start()

            cc.tween(this.node)
                .to(this.timeToVisibility, {opacity: 255})
                .start()
        }
    }
});
