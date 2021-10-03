import GameEvent from 'GameEvent';

cc.Class({
	extends: cc.Component,

	properties: {
		topButton: '',
		downButton: '',
		leftButton: '',
		rightButton: '',
		useButton: '',
		runButton: '',
		rotateClockwiseButton: '',
		rotateCounterclockButton: '',
		pushPotionButton: '',
		pullPotionButton: '',

		_topButtonPressed: false,
		_downButtonPressed: false,
		_leftButtonPressed: false,
		_rightButtonPressed: false,
		_useButtonPressed: false,
		_runButtonPressed: false,
		_rotateClockwisePressed: false,
		_rotateCounterClockPressed: false,
		_pushPotionPressed: false,
		_pullPotionPressed: false
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

		this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
		this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
		this.node.on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
	},

	start () {

	},

	// update (dt) {},

	onKeyDown: function (event) {
		switch(event.keyCode) {
			case cc.macro.KEY[this.topButton]:

				if (!this._topButtonPressed) {
					cc.systemEvent.emit(GameEvent.UP_BUTTON_PRESSED);
					this._topButtonPressed = true;
				}

				break;

			case cc.macro.KEY[this.downButton]:

				if (!this._downButtonPressed) {
					cc.systemEvent.emit(GameEvent.DOWN_BUTTON_PRESSED);
					this._downButtonPressed = true;
				}

				break;

			case cc.macro.KEY[this.leftButton]:

				if (!this._leftButtonPressed) {
					cc.systemEvent.emit(GameEvent.LEFT_BUTTON_PRESSED);
					this._leftButtonPressed = true;
				}

				break;

			case cc.macro.KEY[this.rightButton]:

				if (!this._rightButtonPressed) {
					cc.systemEvent.emit(GameEvent.RIGHT_BUTTON_PRESSED);
					this._rightButtonPressed = true;
				}

				break;

			case cc.macro.KEY[this.useButton]:
				if (!this._useButtonPressed) {
					cc.systemEvent.emit(GameEvent.USE_BUTTON_PRESSED);
					this._useButtonPressed = true;
				}
				
				break;

			case cc.macro.KEY[this.runButton]:
				if (!this._runButtonPressed) {
					cc.systemEvent.emit(GameEvent.RUN_BUTTON_PRESSED);
					this._runButtonPressed = true;
				}

				break;

			case cc.macro.KEY[this.rotateClockwiseButton]:
				if (!this._rotateClockwisePressed) {
					cc.systemEvent.emit(GameEvent.ROTATE_BUTTON_PRESSED, -1);
					this._rotateClockwisePressed = true;
				}

				break;

			case cc.macro.KEY[this.rotateCounterclockButton]:
				if (!this._rotateCounterClockPressed) {
					cc.systemEvent.emit(GameEvent.ROTATE_BUTTON_PRESSED, 1);
					this._rotateCounterClockPressed = true;
				}

				break;

			case cc.macro.KEY[this.pullPotionButton]:
				if (!this._pullPotionPressed) {
					cc.systemEvent.emit(GameEvent.PULL_BUTTON_PRESSED);
					this._pullPotionPressed = true;
				}

				break;

			case cc.macro.KEY[this.pushPotionButton]:
				if (!this._pushPotionPressed) {
					cc.systemEvent.emit(GameEvent.PUSH_BUTTON_PRESSED);
					this._pushPotionPressed = true;
				}

				break;
		}
	},

	onKeyUp: function (event) {
		switch(event.keyCode) {
			case cc.macro.KEY[this.topButton]:
				cc.systemEvent.emit(GameEvent.UP_BUTTON_RELEASED);

				if (this._topButtonPressed) {
					this._topButtonPressed = false;

				}
				break;

			case cc.macro.KEY[this.downButton]:
				cc.systemEvent.emit(GameEvent.DOWN_BUTTON_RELEASED);

				if (this._downButtonPressed) {
					this._downButtonPressed = false;

				}
				break;

			case cc.macro.KEY[this.leftButton]:
				cc.systemEvent.emit(GameEvent.LEFT_BUTTON_RELEASED);

				if (this._leftButtonPressed) {
					this._leftButtonPressed = false;

				}
				break;

			case cc.macro.KEY[this.rightButton]:
				cc.systemEvent.emit(GameEvent.RIGHT_BUTTON_RELEASED);

				if (this._rightButtonPressed) {
					this._rightButtonPressed = false;
					
				}
				break;

			case cc.macro.KEY[this.useButton]:
				cc.systemEvent.emit(GameEvent.USE_BUTTON_RELEASED);
				if (this._useButtonPressed) {
					this._useButtonPressed = false;
				}
				break;

			case cc.macro.KEY[this.runButton]:
				cc.systemEvent.emit(GameEvent.RUN_BUTTON_RELEASED);
				if (this._runButtonPressed) {
					this._runButtonPressed = false;
				}
				break;

			case cc.macro.KEY[this.rotateClockwiseButton]:
				cc.systemEvent.emit(GameEvent.ROTATE_BUTTON_RELEASED, -1);
				if (this._rotateClockwisePressed) {
					this._rotateClockwisePressed = false;
				}
				break;

			case cc.macro.KEY[this.rotateCounterclockButton]:
				cc.systemEvent.emit(GameEvent.ROTATE_BUTTON_RELEASED, 1);
				if (this._rotateCounterClockPressed) {
					this._rotateCounterClockPressed = false;
				}
				break;

			case cc.macro.KEY[this.pullPotionButton]:
				cc.systemEvent.emit(GameEvent.PULL_BUTTON_RELEASED);
				if (this._pullPotionPressed) {
					this._pullPotionPressed = false;
				}
				break;

			case cc.macro.KEY[this.pushPotionButton]:
				cc.systemEvent.emit(GameEvent.PUSH_BUTTON_RELEASED);
				if (this._pushPotionPressed) {
					this._pushPotionPressed = false;
				}
				break;
		}
	},

	onMouseDown(event) {
		cc.systemEvent.emit(GameEvent.MOUSE_DOWN, cc.v2(event._x, event._y));
	},
	onMouseMove(event) {
		cc.systemEvent.emit(GameEvent.MOUSE_MOVE, cc.v2(event._x, event._y));
	},
	onMouseUp(event) {
		cc.systemEvent.emit(GameEvent.MOUSE_UP, cc.v2(event._x, event._y));
	},
});
