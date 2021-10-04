import CollisionGroups from 'CollisionGroups';

cc.Class({
    extends: cc.Component,

    properties: {
        startDirection: { default: cc.v2(1, 0) },
        speed: { default: 1, type: cc.Float },
        skeleton: { default: null, type: sp.Skeleton },

        rageChance: 1,
        rageDuration: 10,
        rageTestCoolDown: 10,

        _currentDirection: { default: null, serializable: false },
        _isMoveEnable: { default: true, serializable: false },

        _body: { default: null, serializable: false },
        _currentAnimation: { default: null, serializable: false },

        _rageMode: { default: false, serializable: false },
        _rageTimer: { default: 0, serializable: false },
        _rageTestTimer: { default: 0, serializable: false },
    },

    onEnable() {
        this._body = this.getComponent(cc.RigidBody);
        this.skeleton.setAnimation(0, 'idle', true);

        this._setDirection(this.startDirection);
    },

    update(dt) {
        if (this._isMoveEnable && this._body && this._currentDirection) {
            const velocity = this._currentDirection.mul(this.speed);

            this._body.linearVelocity = velocity;
        }

        if (this._rageMode) {
            this._rageTimer += dt;

            if (this._rageTimer > this.rageDuration) {
                this._rageMode = false;

                this.speed = this.speed / 4;

                this._rageTimer = 0;
                this._rageTestTimer = 0;
            }
        } else {
            this._rageTestTimer += dt;
            
            if (this._rageTestTimer > this.rageTestCoolDown) {
                if (Math.random() * 100 < this.rageChance) {
                    this._rageMode = true;

                    this.speed = this.speed * 4;
                }
                this._rageTestTimer = 0;
            }
        }
    },

    _setDirection(direction, callback) {
        this._currentAnimation = this.skeleton.setAnimation(0, 'run', true);
        const directionAngle = Math.atan2(direction.y, direction.x);
        cc.tween(this.node)
            .to(1, { angle: directionAngle * 180 / Math.PI })
            .call(() => {
                this._currentDirection = direction;
                callback instanceof Function && callback();
            })
            .start();
    },

    _getRandomValue(value) {
        const minValue = value - 0.5;
        const maxValue = value + 0.5;

        const currentValue = minValue + Math.random() * (maxValue - minValue); 

        return currentValue;
    },

    onBeginContact(contact, self, other) {

        const otherGroupName = other.node.group;

        if (self.tag === 0) {
            switch(otherGroupName){
                case CollisionGroups.Wall:
                case CollisionGroups.PotionFactory:

                    this._isMoveEnable = false;
                    this.skeleton.timeScale = 1;
                    this._currentAnimation = this.skeleton.setAnimation(0, 'idle', true);
                    const reverseCurrentDirection = this._currentDirection.neg();

                    this.scheduleOnce(()=>{
                        this._body.linearVelocity = cc.Vec2.ZERO;
                        this._setDirection(
                            cc.v2(this._getRandomValue(reverseCurrentDirection.x), this._getRandomValue(reverseCurrentDirection.y)).normalizeSelf(),
                            () => {
                                this._isMoveEnable = true;
                                this.skeleton.timeScale = this._rageMode ? 2 : 1;
                                this._currentAnimation = this.skeleton.setAnimation(0, 'run', true);
                            }
                        );
                    }, 1)

                    break;

                default: 
                    break;
            }
        }

    },  
});
