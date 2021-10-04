import GameEvent from 'GameEvent';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

const VisitorStatus = cc.Enum({
    Arriving: 0,
    Waiting: 1,
    Leaving: 2
});

const VisitorSkins = [
    'acorn_ogre',
    'mushroom_ogre'
];

cc.Class({
    extends: InteractionArea,

    properties: {
        visitorIndex: 0,
        skeleton: { default: null, type: sp.Skeleton },
        status: { default: VisitorStatus.Arriving, type: VisitorStatus },

        _isMoving: { default: false, serializable: false },
        _animation: { default: null, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._animation = this.getComponent(cc.Animation);

        this.skeleton.setSkin(VisitorSkins[Math.round((VisitorSkins.length - 1) * Math.random())]);

        this._handleSubscription(true);

        this.onWalkEnd();
    },

    start () {
    },

    update (dt) {
    },

    onWalkStart() {
        this.skeleton && this.skeleton.setAnimation(0, 'run', true);
        this._isMoving = true;
    },

    onWalkEnd() {
        this.skeleton && this.skeleton.setAnimation(0, 'idle', true);
        this._isMoving = false;

        switch (this.status) {
            case VisitorStatus.Arriving: 
                this.status = VisitorStatus.Waiting;
                break;
            case VisitorStatus.Waiting: 
                this.status = VisitorStatus.Leaving;
                this.scheduleOnce(() => {
                    cc.systemEvent.emit(GameEvent.START_TIMER);
                }, 1);
                break;
            case VisitorStatus.Leaving: 
                this.node.destroy();
                break;
        }
    },

    changeStatus() {
        switch (this.status) {
            case VisitorStatus.Arriving: 
                this._animation.play(this._animation._clips[0].name);
                break;
            case VisitorStatus.Waiting: 
                this.scheduleOnce(() => {
                    this._animation.play(this._animation._clips[1].name);
                }, 3);
                break;
            case VisitorStatus.Leaving: 
                this._animation.play(this._animation._clips[2].name);
                break;
        }
    },

    interact(initiator) {
        if (initiator.getPotionType() === PotionTypes.Result) {
            initiator.setPotionType(PotionTypes.None);
            initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);

            cc.systemEvent.emit(GameEvent.ORDER_COMPLITED);
            this._escape();
        } 
    },

    stopInteract(initiator) {
    },

    instantInteract() {
        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients) => { 
            cc.systemEvent.emit(GameEvent.SHOW_BUBBLE, this.node.position, ingridients);
        });
    },

    stopInstantInteract() {
        cc.systemEvent.emit(GameEvent.HIDE_BUBBLE);
    },

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.POTION_WASTED, this.onPotionWasted, this);
		cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
	},

    onPotionWasted() {
        this.changeStatus();
    },

    onOrderComplited() {
        this.changeStatus();
    }
});
