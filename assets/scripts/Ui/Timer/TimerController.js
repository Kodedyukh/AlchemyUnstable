import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
    	firstTimer: {default: 240},
        timeForTimer: { default: 60, type: cc.Integer },
        startColor: cc.Color.WHITE,
        endColor: cc.Color.WHITE,

        render: { default: null, type: cc.Sprite },
        backRender: { default: null, type: cc.Sprite },

        _tween: { default: null, serializable: false },
        _isActive: { default: true, serializable: false },
        _isFirstTimer: {default: true, serializable: false}
    },

    onLoad() {
        this._handleSubscription(true);

        this.node.active = false;
    },

    update() {
        if (this.node.active) {
            this.render.node.color = this.startColor.lerp(this.endColor, 1 - this.render.fillRange);

            this.backRender.fillRange = this.render.fillRange;
            this.backRender.node.color = this.render.node.color;
        }
    },

    _handleSubscription(isOn) {
        const func = isOn ? 'on' : 'off';

        cc.systemEvent[func](GameEvent.START_TIMER, this.onStartTimer, this);
        cc.systemEvent[func](GameEvent.POTION_WASTED, this.onPotionWasted, this);
        cc.systemEvent[func](GameEvent.POTION_CRASHED, this.onPotionCrashed, this);
        cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
        cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
        cc.systemEvent[func](GameEvent.GAME_OVER, this.onGameOver, this);
    },

    _startCallback() {
        this._activate();
    },

    _endCallback() {
        cc.tween(this.node)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this._deactivate();
                cc.systemEvent.emit(GameEvent.ORDER_OUT_OF_TIME);
                cc.systemEvent.emit(GameEvent.HP_MINUS);
            })
            .start();
    },

    _activate() {
        this.node.opacity = 0;
        this.node.active = true;

        if (this._isFirstTimer) this._isFirstTimer = false;

        cc.tween(this.node).to(0.5, { opacity: 255 }).start();
    },

    _deactivate() {
        this.node.active = false;
        if (this._tween) this._tween.stop();

        this.render.fillRange = 1;
        this.backRender.fillRange = 1;
    },

    onPotionWasted() {
        this._deactivate();
    },

    onPotionCrashed() {
        this._deactivate();
    },

    onOrderComplited() {
        this._deactivate();
    },

    onOrderOutOfTime() {
        this._deactivate();
    },

    onStartTimer() {
        if (this.render && this._isActive) {

        	const timerDuration = this._isFirstTimer? this.firstTimer: this.timeForTimer;

            this._tween = cc.tween(this.render);
            this._tween
                .call(() => {
                    this._startCallback();
                })
                .to(timerDuration, { fillRange: 0 })
                .call(() => {
                    this._endCallback();
                })
                .start();
        }
    },

    onGameOver() {
        this._deactivate();
        this._isActive = false;
    },
});
