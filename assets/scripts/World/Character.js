import GameEvent from 'GameEvent';
import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';
import Potion from 'Potion';
import PotionTypes from 'PotionTypes';

const PlayerInputsHelper = cc.Class({
	name: 'PlayerInputsHelper',
	properties: {
		left: false,
		right: false,
		top: false,
		down: false,
		use: false
	},
});

const PlayerAnimations = cc.Enum({
    Idle: 'player_idle',
    Run: 'player_run',
    Jump: 'player_jump',
    Repair: 'player_repair'
})

cc.Class({
	extends: cc.Component,

	properties: {
		runVelocity: 100,
		walkVelocity: 100,
		interactionMark: {
			default: null,
			type: cc.Node
		},
		interactionMarkOffset: {
			default: cc.Vec2.ZERO,
            visible() { return this.interactionMark !== null }
		},


		inputs: { 
            default() { return new PlayerInputsHelper() }, 
            type: PlayerInputsHelper, 
            visible: false 
        },
		interactionAreas: { 
            default: [], 
            visible: false,
            notify() {
                this.interactionMark.opacity = this.interactionAreas.length === 0 ? 0 : 255;
            } 
        },

		_body: { default: null, serializable: false },
		_joint: { default: null, serializable: false },
		_animation: { default: null, serializable: false },
		_potion: { default: null, serializable: false },

		_isPinned: {default: false, serializable: false},
		_isPaused: {default: false, serializable: false},

        _currentAnimation: { default: null, serializable: false },
        _lastMousePosition: { default: null, serializable: false },
        
		_realAngle: { default: 0, serializable: false },
		_turns: { default: 0, serializable: false },

		_isSleepingPlayer: { default: false, serializable: false},

		_isRunning: {default: false, serializable: false}
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
        this._lastMousePosition = cc.Vec2.ZERO;

		this._body = this.getComponentInChildren(cc.RigidBody);
        this._joint = this.getComponentInChildren(cc.Joint);
		this._animation = this.getComponentInChildren(cc.Animation);
		this._potion = this.getComponentInChildren(Potion);

        if (this._body) {
            this._body.onBeginContact = (c, s, o) => { this.onBeginContact(c, s, o) };
            this._body.onEndContact = (c, s, o) => { this.onEndContact(c, s, o) };
        }

        if (this._potion) {
            this._potion.holder = this;
        }

		this._handleSubscription(true); 
	},

	start () {
		if (this.interactionMark) this.interactionMark.opacity = 0;
	},

	update (dt) {
		if (!this._isPaused && this._body) {
			const velocity = cc.Vec2.ZERO;

			if (this.inputs.left) velocity.x -= this._isRunning? this.runVelocity: this.walkVelocity;
			if (this.inputs.right) velocity.x += this._isRunning? this.runVelocity: this.walkVelocity;
			if (this.inputs.top) velocity.y += this._isRunning? this.runVelocity: this.walkVelocity;
			if (this.inputs.down) velocity.y -= this._isRunning? this.runVelocity: this.walkVelocity;

			this._body.linearVelocity = velocity;
            this._countAngle();
            //this._setAnimation();

            if (this.interactionMark) {
                const bodyPosition = this._body.node.position;
                this.interactionMark.setPosition(bodyPosition.add(this.interactionMarkOffset));
            }
		}
	},

    hasPotion() {
        return this._potion.type !== PotionTypes.None;
    },

    setPotionType(potionType) {
        this._potion.type = potionType;
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

		cc.systemEvent[func](GameEvent.MOUSE_MOVE, this.onMouseMove, this);

		cc.systemEvent[func](GameEvent.TOGGLE_PAUSE, this.onTogglePause, this);
	},

    _countAngle() {
        const mousePosition = cc.Camera.main.getScreenToWorldPoint(this._lastMousePosition);
        const selfPosition = this.node.convertToWorldSpaceAR(this._body.node);

        let angle = Math.atan2(mousePosition.y - selfPosition.y, mousePosition.x - selfPosition.x) * 180 / Math.PI;
        if (mousePosition.y < selfPosition.y) angle = 360 + angle;

        if (angle < 90 && this._realAngle > 300) this._turns++;
        if (angle > 300 && this._realAngle < 90) this._turns--;

        this._realAngle = angle;

        this._body.angularVelocity = .001;
        this._body.node.angle = this._turns * 360 + angle;
        this._body.angularVelocity = 0;
    },

    _setAnimation() {
        let animation = PlayerAnimations.Idle;

        if (this._isJumping) {
            animation = PlayerAnimations.Jump;
        } else {
            if (this.inputs.left) {
                animation = PlayerAnimations.Run;
                this.node.scaleX = -1;
            } else if (this.inputs.right) {
                animation = PlayerAnimations.Run;
                this.node.scaleX = 1;
            } /*else if (this.inputs.use && this.interactionAreas.length && this.interactionAreas[0].repairable) {
                animation = PlayerAnimations.Repair;
            }*/
        }

        if (this._currentAnimation !== animation) {
            this._currentAnimation = animation;
            this._animation.play(animation);
        }
    },

	onLeftButtonPressed() {
		if (!this._isPinned){
			this.inputs.left = true;
		}
		
	},
	onLeftButtonReleased() {
		if (!this._isPinned){
			this.inputs.left = false;
		}
	},
	onRightButtonPressed() {
		if (!this._isPinned){
			this.inputs.right = true;
		}
	},
	onRightButtonReleased() {
		if (!this._isPinned){
			this.inputs.right = false;
		}
	},
	onUpButtonPressed() {
		if (!this._isPinned){
			this.inputs.top = true;
		}
	},
	onUpButtonReleased() {
		if (!this._isPinned){
			this.inputs.top = false;
		}
	},
	onDownButtonPressed() {
		if (!this._isPinned){
			this.inputs.down = true;
		}
	},
	onDownButtonReleased() {
		if (!this._isPinned){
			this.inputs.down = false;
		}
	},

	onUseButtonPressed() {
		if (!this._isSleepingPlayer){
			this.inputs.use = true;

			if (this.interactionAreas.length) {
				this.interactionAreas[0].interact(this);
			}
		}
	},
	onUseButtonReleased() {
		if (!this._isSleepingPlayer){
			this.inputs.use = false;
		}
	},

	onRunButtonPressed() {
		this._isRunning = true;
	},

	onRunButtonReleased() {
		this._isRunning = false;
	},

    onMouseMove(position) {
        this._lastMousePosition = position;
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
		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Default: {
				if (self.tag === 1) {
                    const interact = other.node.getComponent(InteractionArea);
                    if (!this.interactionAreas.includes(interact) && !this.hasPotion()) {
                        this.interactionAreas = this.interactionAreas.concat(interact);
                    }
				}
				
			} break;
		}
	},
	onEndContact(contact, self, other) {
		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Default: {
				if (self.tag === 1) {
                    const interact = other.node.getComponent(InteractionArea);
                    this.interactionAreas = this.interactionAreas.filter(a => a !== interact);
				}
			} break;
		}
	}
});
