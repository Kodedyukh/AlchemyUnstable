import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        topButton: '',
        downButton: '',
        leftButton: '',
        rightButton: '',
        useButton: '',

        _topButtonPressed: false,
        _downButtonPressed: false,
        _leftButtonPressed: false,
        _rightButtonPressed: false,
        _useButtonPressed: false
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
