import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        timeForTimer: { default: 60, type: cc.Integer },
        startColor: cc.Color.WHITE,
        endColor: cc.Color.WHITE,
    
        render: { default: null, type: cc.Sprite },
        backRender: { default: null, type: cc.Sprite },
        
        _tween: { default: null, serializable: false },
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
		cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
	},

    _startCallback() {
        this.node.opacity = 0;
        this.node.active = true;

        cc.tween(this.node).to(.5, { opacity: 255 }).start();
    },

    _endCallback(force) {
        cc.tween(this.node).to(.5, { opacity: 0 })
            .call(() => {
                this.node.active = false;
                if (this._tween) this._tween.stop();

                this.render.fillRange = 1;
                this.backRender.fillRange = 1;
                !force && cc.systemEvent.emit(GameEvent.POTION_WASTED);
            })
            .start();
    },

    onPotionWasted() {
        this.node.active && this._endCallback(true);
    },
    
    onOrderComplited() {
        this.node.active && this._endCallback(true);
    },
    
    onStartTimer() {
        if (this.render) {
            this._tween = cc.tween(this.render);
            this._tween.call(() => { this._startCallback() })
                .to(this.timeForTimer, { fillRange: 0 })
                .call(() => { this._endCallback() })
                .start();
        }
    },
});
