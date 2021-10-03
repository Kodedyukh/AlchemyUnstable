cc.Class({
    extends: cc.Component,

    properties: {
        body: { default: null, type: cc.RigidBody },
        baseSkeleton: { default: null, type: sp.Skeleton },
        headSkeleton: { default: null, type: sp.Skeleton },

        _currentState: { default: null, serializable: false },
        _headTurning: { default: null, serializable: false },
        _baseTurning: { default: null, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        this._baseTurning = this.baseSkeleton.setAnimation(1, 'turn_360', true);
        this._baseTurning.timeScale = 0;
        this._headTurning = this.headSkeleton.setAnimation(1, 'turn_360', true);
        this._headTurning.timeScale = 0;
        
        window.DEBUGGER_ELEMENT = this
    },

    switchAnimation(name) {
    },

    update (dt) {
        if (this.body.linearVelocity.x !== 0 || this.body.linearVelocity.y !== 0) {
            if (this._currentState !== 'run') {
                this._currentState = 'run';
                this.baseSkeleton.setAnimation(0, 'run', true);
                this.headSkeleton.setAnimation(0, 'run', true);
            }
        } else {
            if (this._currentState !== 'idle') {
                this._currentState = 'idle';
                this.baseSkeleton.setAnimation(0, 'idle', true);
                this.headSkeleton.setAnimation(0, 'idle', true);
            }
        }

        
		const headAngle = (this.body.node.angle % 360 + 360) % 360;
        this._headTurning.trackTime = headAngle / 360 * 2 + .5;

        if (this.body.linearVelocity.x !== 0 || this.body.linearVelocity.y !== 0) {
            const baseAngle = Math.atan2(this.body.linearVelocity.x, this.body.linearVelocity.y) * 180 / Math.PI;
            this._baseTurning.trackTime = ((360 - (360 + baseAngle) % 360 + 180) % 360) / 360  * 2;
        }
    },
});
