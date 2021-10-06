import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';
import GameEvent from 'GameEvent';
import AudioTypes from 'AudioTypes';

const PotionTypeRender = cc.Class({
    name: 'PotionTypeRender',
    properties: {
        type: { default: PotionTypes.None, type: PotionTypes },
        spriteFrame: { default: null, type: cc.SpriteFrame },
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        type: {
            default: PotionTypes.None,
            type: PotionTypes,
            visible: false,
            notify() {
                this._tween && this._tween.stop();
                if (this.type !== PotionTypes.None) {
                    cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER_INDEX, (index) => {
                        this.orderIndex = index;
                        const render = this.renders.find((r) => r.type === this.type);
                        if (render) {
                            this._sprite.spriteFrame = render.spriteFrame;

                            this._tween = cc.tween(this.renderNode);
                            this._tween.to(0.5, { opacity: 255 }).start();
                        }
                        this._collider.sensor = false;
                        this._collider.apply();
                    });
                } else {
                    this.orderIndex = -1;
                    this._collider.sensor = true;
                    this._collider.apply();

                    this._tween = cc.tween(this.renderNode);
                    this._tween.to(0.15, { opacity: 0 }).start();
                }
            },
        },

        renderNode: {
            default: null,
            type: cc.Node,
        },

        renders: {
            default: [],
            type: PotionTypeRender,
        },

        touchEffect: {
            default: null,
            type: cc.ParticleSystem,
        },

        levelNode: {
            default: null,
            type: cc.Node,
        },

        bottleDropPrefab: {
            default: null,
            type: cc.Prefab,
        },

        velocityThreshold: {
            default: 100,
        },

        contactCooldown: {
            default: 0.05,
        },

        holder: { default: null, visible: false },
        orderIndex: { default: null, visible: false },

        _sprite: { default: null, serializable: false },
        _effectNode: { default: null, serializable: false },

        _animation: { default: null, serializable: false },
        _collider: { default: null, serializable: false },
        _tween: { default: null, serializable: false },

        _inContact: { default: false, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._sprite = this.renderNode.getChildByName('Sprite').getComponent(cc.Sprite);
        this._effectNode = this.renderNode.getChildByName('Effect');

        this._animation = this.renderNode.getComponent(cc.Animation);
        this._collider = this.getComponent(cc.PhysicsCircleCollider);
        this._body = this.getComponent(cc.RigidBody);

        //this._effectNode.opacity = 0;
        this.renderNode.opacity = 0;

        if (this._animation) {
            this._animation.on('finished', this.shakeEnd, this);
        }
    },

    start() {},

    update(dt) {},

    shakeEnd() {
        this._destroy();
        //this.renderNode.setPosition(cc.v2());
        //this.renderNode.angle = 0;
    },

    _launchExplodeTimer() {
        this._animation.play();
        cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.BottleScratch);

        if (this.touchEffect) {
            this.touchEffect.resetSystem();
        }

        //this.scheduleOnce(this._destroy, 1.5);
    },

    _stopExplodeTimer() {
        this._animation.stop();
        cc.systemEvent.emit(GameEvent.STOP_AUDIO, AudioTypes.BottleScratch);

        if (this.touchEffect) {
            this.touchEffect.stopSystem();
        }

        //this.renderNode.setPosition(cc.v2());
        //this.renderNode.angle = 0;

        //this.unschedule(this._destroy);
    },

    _destroy() {
        if (this.type === PotionTypes.Result) {
            cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER_INDEX, (index) => {
                if (index === this.orderIndex) {
                    cc.systemEvent.emit(GameEvent.HP_MINUS);
                    cc.systemEvent.emit(GameEvent.POTION_CRASHED, this.orderIndex);
                }
            });
        }

        if (this.levelNode && this.bottleDropPrefab) {
            const globalPos = this.renderNode.convertToWorldSpaceAR(cc.v2());
            const localPos = this.levelNode.convertToNodeSpaceAR(globalPos);

            const effect = cc.instantiate(this.bottleDropPrefab);
            effect.parent = this.levelNode;
            effect.setPosition(localPos);
        }

        if (this.touchEffect) {
            this.touchEffect.stopSystem();
        }

        this.holder.setPotionType(PotionTypes.None);

        cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.Glass);
        cc.systemEvent.emit(GameEvent.STOP_AUDIO, AudioTypes.BottleScratch);
    },

    onBeginContact(contact, self, other) {
        if (this.type === PotionTypes.None) return;

        const otherGroupName = other.node.group;
        switch (otherGroupName) {
            case CollisionGroups.Bench:
                {
                    if (this.type !== PotionTypes.Result) {
                        const interact = other.node.getComponent(InteractionArea);
                        if (interact && !this.holder.interactionAreas.includes(interact)) {
                            this.holder.interactionAreas = this.holder.interactionAreas.concat(interact);
                        }
                    }
                }
                break;
            case CollisionGroups.Visitor:
                {
                    if (this.type === PotionTypes.Result) {
                        const interact = other.node.getComponent(InteractionArea);
                        if (interact && interact.visitorIndex === this.orderIndex && !this.holder.interactionAreas.includes(interact)) {
                            this.holder.interactionAreas = this.holder.interactionAreas.concat(interact);
                        }
                    }
                }
                break;

            case CollisionGroups.Alchemist:
            case CollisionGroups.PotionFactory:
                break;

            case CollisionGroups.Cat:
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.Cat);
            case CollisionGroups.Wall:
                {
                    if (this.type != PotionTypes.None) {
                        const speed = this._body.linearVelocity.mag();

                        if (speed > this.velocityThreshold) {
                            this._destroy();
                        } else {
                            this._inContact = true;
                            this._launchExplodeTimer();
                        }
                    }
                }
                break;
        }
    },

    onEndContact(contact, self, other) {
        if (this.type === PotionTypes.None) return;

        const otherGroupName = other.node.group;
        switch (otherGroupName) {
            case CollisionGroups.Bench:
                {
                    const interact = other.node.getComponent(InteractionArea);
                    if (interact) {
                        this.holder.interactionAreas = this.holder.interactionAreas.filter((a) => a !== interact);
                    }
                }
                break;
            case CollisionGroups.Visitor:
                {
                    if (this.type === PotionTypes.Result) {
                        const interact = other.node.getComponent(InteractionArea);
                        if (interact) {
                            this.holder.interactionAreas = this.holder.interactionAreas.filter((a) => a !== interact);
                        }
                    }
                }
                break;

            case CollisionGroups.Cat:
            case CollisionGroups.Wall:
                {
                    if (this.type != PotionTypes.None) {
                        this._inContact = false;

                        this.scheduleOnce(() => {
                            if (!this._inContact) this._stopExplodeTimer();
                        }, this.contactCooldown);
                    }
                }
                break;
        }
    },
});
