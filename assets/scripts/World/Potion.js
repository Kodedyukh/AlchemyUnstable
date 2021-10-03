import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';
import GameEvent from 'GameEvent';

const PotionTypeRender = cc.Class({
	name: 'PotionTypeRender',
	properties: {
		type: { default: PotionTypes.None, type: PotionTypes },
		spriteFrame: { default: null, type: cc.SpriteFrame }
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
				if (this.type !== PotionTypes.None) {
					cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER_INDEX, (index) => {
						this.orderIndex = index;
						const render = this.renders.find(r => r.type === this.type);
						if (render) {
							this._sprite.spriteFrame = render.spriteFrame;
							this.node.opacity = 255;
							
						}
						this._collider.sensor = false;
						this._collider.apply();
					});

				} else {
					this.orderIndex = -1;
					this.node.opacity = 0;
					this._collider.sensor = true;
					this._collider.apply();
				}
			}
		},

		renderNode: {
			default: null,
			type: cc.Node
		},

		renders: {
			default: [],
			type: PotionTypeRender
		},

		holder: { default: null, visible: false },
		orderIndex: { default: null, visible: false },

		_sprite: { default: null, serializable: false },
		_animation: {default: null, serializable: false},
		_collider: {default: null, serializable: false}
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		this._sprite = this.getComponentInChildren(cc.Sprite);
		this._animation = this.getComponent(cc.Animation);
		this._collider = this.getComponent(cc.PhysicsCircleCollider);
		this.node.opacity = 0;
	},

	start () {
	},

	update (dt) {
	},

	shakeEnd() {
		this._destroy();
		this.renderNode.setPosition(cc.v2());
		this.renderNode.angle = 0;
	},

	_launchExplodeTimer() {
		this._animation.play();

		//this.scheduleOnce(this._destroy, 1.5);
	},

	_stopExplodeTimer() {
		this._animation.stop();

		this.renderNode.setPosition(cc.v2());
		this.renderNode.angle = 0;

		//this.unschedule(this._destroy);
	},

	_destroy() {
		if (this.type === PotionTypes.Result) {
			cc.systemEvent.emit(GameEvent.POTION_WASTED, this.orderIndex);
		}

		this.type = PotionTypes.None;
	},

	onBeginContact(contact, self, other) {
		if (this.type === PotionTypes.None) return;

		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Bench: {
				if (this.type !== PotionTypes.Result) {
					const interact = other.node.getComponent(InteractionArea);
					if (interact && !this.holder.interactionAreas.includes(interact)) {
						this.holder.interactionAreas = this.holder.interactionAreas.concat(interact);
					}
				}
			} break;
			case CollisionGroups.Visitor: {
				if (this.type === PotionTypes.Result) {
					const interact = other.node.getComponent(InteractionArea);
					if (interact && interact.visitorIndex === this.orderIndex && !this.holder.interactionAreas.includes(interact)) {
						this.holder.interactionAreas = this.holder.interactionAreas.concat(interact);
					}
				}
			} break;

			case CollisionGroups.Alchemist: 
			case CollisionGroups.PotionFactory: 
				break;

			case CollisionGroups.Cat:
			case CollisionGroups.Wall: {
				if (this.type != PotionTypes.None) {
					this._launchExplodeTimer();
				}
				
			} break;
		}
	},

	onEndContact(contact, self, other) {
		if (this.type === PotionTypes.None) return;

		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Bench: {
				const interact = other.node.getComponent(InteractionArea);
				if (interact) {
					this.holder.interactionAreas = this.holder.interactionAreas.filter(a => a !== interact);
				}
			} break;
			case CollisionGroups.Visitor: {
				if (this.type === PotionTypes.Result) {
					const interact = other.node.getComponent(InteractionArea);
					if (interact) {
						this.holder.interactionAreas = this.holder.interactionAreas.filter(a => a !== interact);
					}
				}
			} break;

			case CollisionGroups.Cat:
			case CollisionGroups.Wall: {
				if (this.type != PotionTypes.None) {
					this._stopExplodeTimer();
				}
			} break;
		}
	},
});
