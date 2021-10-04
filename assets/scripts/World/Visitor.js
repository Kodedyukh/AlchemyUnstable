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

const SkeletonSettingsHelper = cc.Class({
    name: 'SkeletonSettingsHelper',
    
    properties: {
        data: { default: null, type: sp.Skeleton },
        skins: { default: [], type: cc.String },
        useSpineRotation: false
    }
});

cc.Class({
    extends: InteractionArea,

    properties: {
        visitorIndex: { default: 0, visible: false },
        rotator: { default: null, type: cc.Node },
        skeletonSettings: {
            default: [],
            type: SkeletonSettingsHelper
        },
        skeleton: { default: null, type: sp.Skeleton, visible: false },
        status: { default: VisitorStatus.Arriving, type: VisitorStatus, visible: false },

        _isMoving: { default: false, serializable: false },
        _animation: { default: null, serializable: false },
        _baseTurning: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._animation = this.getComponent(cc.Animation);

        const skeletonSettings = this.skeletonSettings[Math.round((this.skeletonSettings.length - 1) * Math.random())];
        
        this.skeleton = skeletonSettings.data;
        this.skeleton.node.active = true;
        this.skeleton.setSkin(skeletonSettings.skins[Math.round((skeletonSettings.skins.length - 1) * Math.random())]);

        if (skeletonSettings.useSpineRotation) {
            this._baseTurning = this.skeleton.setAnimation(1, 'turn_360', true);
            if (this._baseTurning) {
                this._baseTurning.timeScale = 0;
            }
        }

        this._handleSubscription(true);

        this.onWalkEnd();
    },

    start () {
    },

    update (dt) {
        if (this._baseTurning) { 
            const angle = (this.rotator.angle % 360 + 360) % 360;
            this._baseTurning.trackTime = angle / 360 * 2;
        } else {
            this.node.angle = this.rotator.angle;
        }
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
		cc.systemEvent[func](GameEvent.POTION_CRUSHED, this.onPotionCrushed, this);
		cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
		cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
	},

    onPotionWasted() {
        this.changeStatus();
    },

    onPotionCrushed() {
        this.changeStatus();
    },

    onOrderComplited() {
        this.changeStatus();
    },

    onOrderOutOfTime() {
        this.changeStatus();
    }
});
