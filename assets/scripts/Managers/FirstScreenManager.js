// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        _isMainLoading: {
            default: false,
            serializable: false
        }
    },

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyUp(event) {
        if (event.keyCode === cc.macro.KEY.e && !this._isMainLoading) {
            cc.director.loadScene('Main');
            this._isMainLoading = true;
        }
    }

    // update (dt) {},
});
