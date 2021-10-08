import GameEvent from 'GameEvent';
import AudioTypes from 'AudioTypes';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

const VisitorStatus = cc.Enum({
    Arriving: 0,
    Waiting: 1,
    Leaving: 2,
    Inactive: 3,
});

const VisitorSkins = ['acorn_ogre', 'mushroom_ogre'];

const SkeletonSettingsHelper = cc.Class({
    name: 'SkeletonSettingsHelper',

    properties: {
        data: { default: null, type: sp.Skeleton },
        skins: { default: [], type: cc.String },
        useSpineRotation: false,
    },
});

cc.Class({
    extends: InteractionArea,

    properties: {
        visitorIndex: { default: 0, visible: false },
        rotator: { default: null, type: cc.Node },
        skeletonSettings: {
            default: [],
            type: SkeletonSettingsHelper,
        },
        skeleton: { default: null, type: sp.Skeleton, visible: false },
        status: { default: VisitorStatus.Arriving, type: VisitorStatus, visible: false },

        _isMoving: { default: false, serializable: false },
        _isActive: { default: true, serializable: false },
        _animation: { default: null, serializable: false },
        _baseTurning: { default: null, serializable: false },

        _recipeAnnounceTimer: { default: -1, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
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

    start() {},

    update(dt) {
        if (this._baseTurning) {
            const angle = ((this.rotator.angle % 360) + 360) % 360;
            this._baseTurning.trackTime = (angle / 360) * 2;
        } else {
            this.node.angle = this.rotator.angle;
        }

        if (this._recipeAnnounceTimer > -1) {
            this._recipeAnnounceTimer += dt;
            if (this._recipeAnnounceTimer > 3) {
                this.stopInstantInteract();
                this._recipeAnnounceTimer = -1;
            }
        }
    },

    onWalkStart() {
        this.skeleton && this.skeleton.setAnimation(0, 'run', true);
        this._isMoving = true;

        switch (this.status) {
            case VisitorStatus.Arriving:
                this.status = VisitorStatus.Waiting;
                break;
            case VisitorStatus.Waiting:
                this.status = VisitorStatus.Leaving;
                break;
            case VisitorStatus.Leaving:
                this.status = VisitorStatus.Inactive;
                break;
        }
    },

    onWalkEnd() {
        this.skeleton && this.skeleton.setAnimation(0, 'idle', true);
        this._isMoving = false;

        switch (this.status) {
            case VisitorStatus.Leaving:
                this.scheduleOnce(() => {
                    cc.systemEvent.emit(GameEvent.START_TIMER);
                }, 1);
                break;
            case VisitorStatus.Inactive:
                this.node.destroy();
                break;
        }

        if (!this._isActive) {
            this.changeStatus();
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
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.Mumble);
                break;
        }
    },

    interact(initiator) {
        if (initiator.getPotionType() === PotionTypes.Result) {
            initiator.setPotionType(PotionTypes.None);
            initiator.interactionAreas = initiator.interactionAreas.filter((a) => a !== this);

            cc.systemEvent.emit(GameEvent.ORDER_COMPLITED);
        }
    },

    stopInteract(initiator) {},

    instantInteract() {
        if (this._recipeAnnounceTimer > 0) {
            this._recipeAnnounceTimer = -1;
        }

        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients) => {
            cc.systemEvent.emit(GameEvent.SHOW_BUBBLE, this.node, ingridients);
        });
    },

    stopInstantInteract() {
        cc.systemEvent.emit(GameEvent.HIDE_BUBBLE);
    },

    _handleSubscription(isOn) {
        const func = isOn ? 'on' : 'off';

        cc.systemEvent[func](GameEvent.POTION_WASTED, this.onPotionWasted, this);
        cc.systemEvent[func](GameEvent.POTION_CRASHED, this.onPotionCrashed, this);
        cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
        cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
        cc.systemEvent[func](GameEvent.MOVE_VISITORS, this.onMoveVisitors, this);
        cc.systemEvent[func](GameEvent.GAME_OVER, this.onGameOver, this);
        cc.systemEvent[func](GameEvent.START_TIMER, this.onStartTimer, this);
    },

    onPotionWasted() {
        this.changeStatus();
    },

    onPotionCrashed() {
        this.changeStatus();
    },

    onOrderComplited() {
        this.changeStatus();
    },

    onOrderOutOfTime() {
        this.changeStatus();
    },

    onMoveVisitors() {
        this.changeStatus();
    },

    onGameOver() {
        this._isActive = false;
    },

    onStartTimer() {
        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER_INDEX, (index) => {
            if (this.visitorIndex === index) {
                cc.systemEvent.emit(GameEvent.GET_CHARACTER_HALL_STATE, (isInHall) => {
                    if (isInHall) {
                        cc.log('announce recipe');
                        this.instantInteract();
                        this._recipeAnnounceTimer = 0;
                    }
                });
            }
        });
    },
});
