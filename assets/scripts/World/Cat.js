import CollisionGroups from 'CollisionGroups';

cc.Class({
    extends: cc.Component,

    properties: {
        startDirection: { default: cc.v2(1, 0) },
        speed: { default: 1, type: cc.Float },

        _currentDirection: { default: null, serializable: false },
        _isMoveEnable: { default: true, serializable: false },
        _body: { default: null, serializable: false },
    },

    onEnable() {
        this._body = this.getComponent(cc.RigidBody);

        this._setDirection(this.startDirection);
    },

    update(dt) {
        if (this._isMoveEnable && this._body) {
            const velocity = this._currentDirection.mul(this.speed);

            this._body.linearVelocity = velocity;
        }
    },

    _setDirection(direction) {
        const directionAngle = Math.atan2(direction.y, direction.x);
        this.node.angle = directionAngle * 180 / Math.PI;
        this._currentDirection = direction;
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
                    const reverseCurrentDirection = this._currentDirection.neg();

                    this.scheduleOnce(()=>{
                        this._body.linearVelocity = cc.Vec2.ZERO;
                        this._setDirection(cc.v2(this._getRandomValue(reverseCurrentDirection.x), this._getRandomValue(reverseCurrentDirection.y)).normalizeSelf());
                        this._isMoveEnable = true;
                    }, 1)

                    break;

                default: 
                    break;
            }
        }

    },  
});
