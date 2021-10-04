import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        pageFrames: {
            default: [],
            type: [cc.SpriteFrame]
        },

        renderNode: {
            default: null,
            type: cc.Node
        },

        _currentIndex: {
            default: 0
        },

        _sprite: {
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onEnable () {
        this._sprite = this.renderNode.getComponent(cc.Sprite);
        this._sprite.spriteFrame = this.pageFrames[this._currentIndex];

        cc.systemEvent.on(GameEvent.HELP_PAGE_FORWARD, this.onHelpPageForward, this);
        cc.systemEvent.on(GameEvent.HELP_PAGE_BACK, this.onHelpPageBack, this);
        cc.systemEvent.on(GameEvent.HELP_PAGE_OFF, this.onHelpPageOff, this);
    },

    onHelpPageForward() {
        this._currentIndex = Math.min(this._currentIndex + 1, this.pageFrames.length - 1);

        this._sprite.spriteFrame = this.pageFrames[this._currentIndex];
    },

    onHelpPageBack() {
        this._currentIndex = Math.max(this._currentIndex - 1, 0);

        this._sprite.spriteFrame = this.pageFrames[this._currentIndex];
    },

    onHelpPageOff() {
        this.node.opacity = 0;
    }

    // update (dt) {},
});