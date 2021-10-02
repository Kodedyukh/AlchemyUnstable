cc.Class({
    extends: cc.Component,

    properties: {
        timeForTimer: { default: 10, type: cc.Integer },
    
        _render: { default: null, serializable: false }
    },

    onEnable() {
        this._render = this.getComponentInChildren(cc.Sprite);
    
        this.node.active = false;
        this.startTimer();
    },

    startTimer() {

        if (this._render) {
            cc.tween(this._render)
                .call(() => { this._startCallback() })
                .to(this.timeForTimer, {fillRange: 0})
                .call(() => { this._endCallback() })
                .start()
        }
    },

    _startCallback() {
        this.node.active = true;
    },

    _endCallback() {
        this.node.active = false;

        this._render.fillRange = 1;
    },
});
