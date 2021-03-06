import GameEvent from 'GameEvent';
import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';
import Potion from 'Potion';
import PotionTypes from 'PotionTypes';
import Visitor from 'Visitor';

const PlayerInputsHelper = cc.Class({
    name: 'PlayerInputsHelper',
    properties: {
        left: false,
        right: false,
        top: false,
        down: false,
        use: false,
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        runVelocity: 100,
        walkVelocity: 100,
        rotationVelocity: 0,
        rotationVelocityWithPotion: 0,
        potionSpeed: 10,
        potionDistanceMax: 300,
        interactionMark: {
            default: null,
            type: cc.Node,
        },
        interactionMarkOffset: {
            default: cc.Vec2.ZERO,
            visible() {
                return this.interactionMark !== null;
            },
        },

        rayNode: {
            default: null,
            type: cc.Node,
        },

        inputs: {
            default() {
                return new PlayerInputsHelper();
            },
            type: PlayerInputsHelper,
            visible: false,
        },
        interactionAreas: {
            default: [],
            visible: false,
            notify() {
                this.interactionMark.opacity = this.interactionAreas.length === 0 ? 0 : 255;
            },
        },

        _body: { default: null, serializable: false },
        _joint: { default: null, serializable: false },
        _animation: { default: null, serializable: false },
        _potion: { default: null, serializable: false },

        _isPinned: { default: false, serializable: false },
        _isPaused: { default: false, serializable: false },

        _currentAnimation: { default: null, serializable: false },
        //_lastMousePosition: { default: null, serializable: false },

        //_realAngle: { default: 0, serializable: false },
        //_turns: { default: 0, serializable: false },

        _isSleepingPlayer: { default: false, serializable: false },
        _isInHall: { default: true, serializable: false },

        _isRunning: { default: false, serializable: false },
        _rotationDirection: { default: 0, serializable: false },
        _currentRotationVelocity: { default: 0, serializable: false },
        _potionVelocity: { default: 0, serializable: false },

        _bodyRender: { default: null, serializable: false },
        _potionRender: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        //this._lastMousePosition = cc.Vec2.ZERO;

        this._body = this.getComponentInChildren(cc.RigidBody);
        this._joint = this.getComponentInChildren(cc.Joint);
        this._animation = this.getComponentInChildren(cc.Animation);
        this._potion = this.getComponentInChildren(Potion);

        if (this._body) {
            this._body.onBeginContact = (c, s, o) => {
                this.onBeginContact(c, s, o);
            };
            this._body.onEndContact = (c, s, o) => {
                this.onEndContact(c, s, o);
            };
        }

        if (this._potion) {
            this._potion.holder = this;
        }

        this._bodyRender = this.node.getChildByName('Skeleton');
        this._potionRender = this.node.getChildByName('PotionRender');

        if (this._bodyRender) this._bodyRender.zIndex = 5;
        if (this.interactionMark) this.interactionMark.zIndex = 10;

        this.rayNode.active = false;

        this._handleSubscription(true);
    },

    start() {
        if (this.interactionMark) this.interactionMark.opacity = 0;
    },

    update(dt) {
        if (!this._isPaused && this._body) {
            const velocity = cc.Vec2.ZERO;

            if (this.inputs.left) velocity.x -= this._isRunning ? this.runVelocity : this.walkVelocity;
            if (this.inputs.right) velocity.x += this._isRunning ? this.runVelocity : this.walkVelocity;
            if (this.inputs.top) velocity.y += this._isRunning ? this.runVelocity : this.walkVelocity;
            if (this.inputs.down) velocity.y -= this._isRunning ? this.runVelocity : this.walkVelocity;

            this._body.linearVelocity = velocity;
            this._countAngle();

            if (this._potionVelocity !== 0 && this._potion.type !== PotionTypes.None) {
                const currentDistance = this._joint.connectedAnchor.x;
                const newDistance = currentDistance + dt * this._potionVelocity;

                this._joint.connectedAnchor = cc.v2(Math.max(Math.min(-20, newDistance), -this.potionDistanceMax), 0);
                this._joint.apply();

                this._potionVelocity =
                    this._potionVelocity > 0
                        ? Math.min(1.06 * this._potionVelocity, this.potionSpeed)
                        : Math.max(1.06 * this._potionVelocity, -this.potionSpeed);
            }

            if (this._potionRender) {
                const angle = ((this._body.node.angle % 360) + 360) % 360;
                this._potionRender.zIndex = angle > 180 ? 6 : 4;
            }
        }
    },

    hasPotion() {
        return this._potion.type !== PotionTypes.None;
    },

    getPotionType() {
        return this._potion.type;
    },

    setPotionType(potionType) {
        this._potion.type = potionType;
        this._joint.connectedAnchor = cc.v2(-20, 0);
        this._joint.apply();

        this.rayNode.active = potionType !== PotionTypes.None;
    },

    _handleSubscription(isOn) {
        const func = isOn ? 'on' : 'off';

        cc.systemEvent[func](GameEvent.LEFT_BUTTON_PRESSED, this.onLeftButtonPressed, this);
        cc.systemEvent[func](GameEvent.LEFT_BUTTON_RELEASED, this.onLeftButtonReleased, this);

        cc.systemEvent[func](GameEvent.RIGHT_BUTTON_PRESSED, this.onRightButtonPressed, this);
        cc.systemEvent[func](GameEvent.RIGHT_BUTTON_RELEASED, this.onRightButtonReleased, this);

        cc.systemEvent[func](GameEvent.UP_BUTTON_PRESSED, this.onUpButtonPressed, this);
        cc.systemEvent[func](GameEvent.UP_BUTTON_RELEASED, this.onUpButtonReleased, this);

        cc.systemEvent[func](GameEvent.DOWN_BUTTON_PRESSED, this.onDownButtonPressed, this);
        cc.systemEvent[func](GameEvent.DOWN_BUTTON_RELEASED, this.onDownButtonReleased, this);

        cc.systemEvent[func](GameEvent.USE_BUTTON_PRESSED, this.onUseButtonPressed, this);
        cc.systemEvent[func](GameEvent.USE_BUTTON_RELEASED, this.onUseButtonReleased, this);

        cc.systemEvent[func](GameEvent.RUN_BUTTON_PRESSED, this.onRunButtonPressed, this);
        cc.systemEvent[func](GameEvent.RUN_BUTTON_RELEASED, this.onRunButtonReleased, this);

        cc.systemEvent[func](GameEvent.ROTATE_BUTTON_PRESSED, this.onRotateButtonPressed, this);
        cc.systemEvent[func](GameEvent.ROTATE_BUTTON_RELEASED, this.onRotateButtonReleased, this);

        cc.systemEvent[func](GameEvent.PULL_BUTTON_PRESSED, this.onPullButtonPressed, this);
        cc.systemEvent[func](GameEvent.PULL_BUTTON_RELEASED, this.onPullButtonReleased, this);

        cc.systemEvent[func](GameEvent.PUSH_BUTTON_PRESSED, this.onPushButtonPressed, this);
        cc.systemEvent[func](GameEvent.PUSH_BUTTON_RELEASED, this.onPushButtonReleased, this);

        //cc.systemEvent[func](GameEvent.MOUSE_MOVE, this.onMouseMove, this);

        cc.systemEvent[func](GameEvent.TOGGLE_PAUSE, this.onTogglePause, this);

        cc.systemEvent[func](GameEvent.POTION_IS_READY, this.onPotionIsReady, this);
        cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
        cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
        cc.systemEvent[func](GameEvent.POTION_CRASHED, this.onPotionCrashed, this);

        cc.systemEvent[func](GameEvent.GET_CHARACTER_HALL_STATE, this.onCharacterGetHallState, this);
    },

    _countAngle() {
        // for mouse
        // const mousePosition = cc.Camera.main.getScreenToWorldPoint(this._lastMousePosition);
        // const selfPosition = this.node.convertToWorldSpaceAR(this._body.node);

        // let angle = Math.atan2(mousePosition.y - selfPosition.y, mousePosition.x - selfPosition.x) * 180 / Math.PI;
        // if (mousePosition.y < selfPosition.y) angle = 360 + angle;

        // if (angle < 90 && this._realAngle > 300) this._turns++;
        // if (angle > 300 && this._realAngle < 90) this._turns--;

        // this._realAngle = angle;

        // this._body.angularVelocity = .001;
        // this._body.node.angle = this._turns * 360 + angle;
        // this._body.angularVelocity = 0;

        // for arrows
        this._body.angularVelocity = this._currentRotationVelocity * this._rotationDirection;

        const limitVelocity = this._potion.type !== PotionTypes.None ? this.rotationVelocityWithPotion : this.rotationVelocity;

        this._currentRotationVelocity = Math.min(1.08 * this._currentRotationVelocity, limitVelocity);
    },

    onLeftButtonPressed() {
        if (!this._isPinned) {
            this.inputs.left = true;
        }
    },
    onLeftButtonReleased() {
        if (!this._isPinned) {
            this.inputs.left = false;
        }
    },
    onRightButtonPressed() {
        if (!this._isPinned) {
            this.inputs.right = true;
        }
    },
    onRightButtonReleased() {
        if (!this._isPinned) {
            this.inputs.right = false;
        }
    },
    onUpButtonPressed() {
        if (!this._isPinned) {
            this.inputs.top = true;
        }
    },
    onUpButtonReleased() {
        if (!this._isPinned) {
            this.inputs.top = false;
        }
    },
    onDownButtonPressed() {
        if (!this._isPinned) {
            this.inputs.down = true;
        }
    },
    onDownButtonReleased() {
        if (!this._isPinned) {
            this.inputs.down = false;
        }
    },

    onUseButtonPressed() {
        if (!this._isSleepingPlayer) {
            this.inputs.use = true;

            if (this.interactionAreas.length) {
                this.interactionAreas[0].interact(this);
            }
        }
    },
    onUseButtonReleased() {
        if (!this._isSleepingPlayer) {
            this.inputs.use = false;

            if (this.interactionAreas.length) {
                this.interactionAreas[0].stopInteract(this);
            }
        }
    },

    onRunButtonPressed() {
        this._isRunning = true;
    },

    onRunButtonReleased() {
        this._isRunning = false;
    },

    onMouseMove(position) {
        //this._lastMousePosition = position;
    },

    onTogglePause(isOn) {
        if (!this._isPaused && isOn) {
            this._isPaused = true;
            cc.systemEvent.emit(GameEvent.PIN_PLAYER, true);
        } else if (this._isPaused && !isOn) {
            this._isPaused = false;
            cc.systemEvent.emit(GameEvent.PIN_PLAYER, false);
        }
    },

    onBeginContact(contact, self, other) {
        if (self.tag === 1) {
            const interact = other.node.getComponent(InteractionArea);
            const otherGroupName = other.node.group;
            switch (otherGroupName) {
                case CollisionGroups.PotionFactory:
                    {
                        if (interact && !this.interactionAreas.includes(interact) && !this.hasPotion()) {
                            this.interactionAreas = this.interactionAreas.concat(interact);
                        }
                    }
                    break;
                case CollisionGroups.Visitor:
                    {
                        if (this.getPotionType() !== PotionTypes.Result) {
                            cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER_INDEX, (index) => {
                                if (interact && interact.visitorIndex === index) {
                                    interact.instantInteract();
                                }
                            });
                        }
                    }
                    break;
                case CollisionGroups.Bench:
                    {
                        interact && interact.instantInteract();
                    }
                    break;
                case CollisionGroups.Hall:
                    {
                        this._isInHall = true;
                    }
                    break;
            }
        }
    },
    onEndContact(contact, self, other) {
        if (self.tag === 1) {
            const interact = other.node.getComponent(InteractionArea);
            const otherGroupName = other.node.group;
            switch (otherGroupName) {
                case CollisionGroups.PotionFactory: {
                    if (interact) {
                        this.interactionAreas = this.interactionAreas.filter((a) => a !== interact);
                    }
                }
                case CollisionGroups.Visitor:
                case CollisionGroups.Bench:
                    {
                        interact && interact.stopInstantInteract();
                    }
                    break;
                case CollisionGroups.Hall:
                    {
                        this._isInHall = false;
                    }
                    break;
            }
        }
    },

    onRotateButtonPressed(direction) {
        this._rotationDirection += direction;

        if (this._rotationDirection !== 0) {
            this._currentRotationVelocity = this.rotationVelocity * 0.1;
        }
    },

    onRotateButtonReleased(direction) {
        this._rotationDirection -= direction;

        if (this._rotationDirection !== 0) {
            this._currentRotationVelocity = this.rotationVelocity * 0.1;
        }
    },

    onPullButtonPressed() {
        this._potionVelocity = 0.1 * this.potionSpeed;
    },

    onPullButtonReleased() {
        this._potionVelocity = 0;
    },

    onPushButtonPressed() {
        this._potionVelocity = -0.1 * this.potionSpeed;
    },

    onPushButtonReleased() {
        this._potionVelocity = 0;
    },

    onPotionIsReady() {
        this.setPotionType(PotionTypes.Result);
    },

    onPotionCrashed() {
        this.interactionAreas = this.interactionAreas.filter((a) => a instanceof Visitor === false);
    },

    onOrderOutOfTime() {
        this.interactionAreas = this.interactionAreas.filter((a) => a instanceof Visitor === false);
    },

    onOrderComplited() {
        this.interactionAreas = this.interactionAreas.filter((a) => a instanceof Visitor === false);
    },

    onCharacterGetHallState(callback) {
        callback instanceof Function && callback(this._isInHall);
    },
});
