import GameEvent from 'GameEvent';
import Visitor from 'Visitor';

cc.Class({
    extends: cc.Component,

    properties: {
        visitorPrefab: { default: null, type: cc.Prefab },

        _visitorCount: { default: 0, serializable: false },
        _isActive: { default: true, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.children.forEach((ch) => {
            ch.destroy();
        });

        const visitor = cc.instantiate(this.visitorPrefab);
        visitor.setParent(this.node);
        visitor.setPosition(cc.v2(-270, -132));

        const visitorComp = visitor.getComponent(Visitor);
        visitorComp.status = 2;
        visitorComp.visitorIndex = this._visitorCount++;
        visitorComp.rotator.angle = 90;

        this._handleSubscription(true);
    },

    start() {
        this.onOrderComplited();
    },

    _addNewVisitor() {
        if (this._isActive) {
            const visitor = cc.instantiate(this.visitorPrefab);
            visitor.setParent(this.node);
            visitor.setPosition(cc.v2(-410, 350));

            const visitorComp = visitor.getComponent(Visitor);
            visitorComp.visitorIndex = this._visitorCount++;
            visitorComp.status = 0;

            this.scheduleOnce(() => {
                visitorComp.getComponent(Visitor).changeStatus();
            });
        }
    },

    _handleSubscription(isOn) {
        const func = isOn ? 'on' : 'off';

        cc.systemEvent[func](GameEvent.POTION_WASTED, this.onPotionWasted, this);
        cc.systemEvent[func](GameEvent.POTION_CRASHED, this.onPotionCrashed, this);
        cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
        cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
        cc.systemEvent[func](GameEvent.HELP_PAGE_OFF, this.onHelpPageOff, this);
        cc.systemEvent[func](GameEvent.GAME_OVER, this.onGameOver, this);
    },

    onPotionWasted() {
        this.scheduleOnce(() => {
            this._addNewVisitor();
        }, 6 + Math.random() * 2);
    },

    onPotionCrashed() {
        this.scheduleOnce(() => {
            this._addNewVisitor();
        }, 6 + Math.random() * 2);
    },

    onOrderComplited() {
        this.scheduleOnce(() => {
            this._addNewVisitor();
        }, 6 + Math.random() * 2);
    },

    onOrderOutOfTime() {
        this.scheduleOnce(() => {
            this._addNewVisitor();
        }, 6 + Math.random() * 2);
    },

    onHelpPageOff() {
        cc.systemEvent.emit(GameEvent.START_TIMER);
    },

    onGameOver() {
        this._isActive = false;
        cc.systemEvent.emit(GameEvent.MOVE_VISITORS);
    },
});
