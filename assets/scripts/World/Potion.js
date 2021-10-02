import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

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
                    const render = this.renders.find(r => r.type === this.type);
                    if (render) {
                        this._sprite.spriteFrame = render.spriteFrame;
                        this.node.opacity = 255;
                    }
                } else {
                    this.node.opacity = 0;
                }
            }
        },

        renders: {
            default: [],
            type: PotionTypeRender
        },

        holder: { default: null, visible: false },

		_sprite: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._sprite = this.getComponentInChildren(cc.Sprite);
        this.node.opacity = 0;
    },

    start () {

    },

    // update (dt) {},

    onBeginContact(contact, self, other) {
        if (this.type === PotionTypes.None) return;

		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Bench: {
                const interact = other.node.getComponent(InteractionArea);
                if (!this.holder.interactionAreas.includes(interact)) {
                    this.holder.interactionAreas = this.holder.interactionAreas.concat(interact);
                }
			} break;
			case CollisionGroups.Alchemist: 
			case CollisionGroups.Default: 
			    break;
			default: {
				this.type = PotionTypes.None;
			} break;
		}
	},

    onEndContact(contact, self, other) {
        if (this.type === PotionTypes.None) return;

		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Bench: {
                const interact = other.node.getComponent(InteractionArea);
                this.holder.interactionAreas = this.holder.interactionAreas.filter(a => a !== interact);
			} break;
		}
	},
});
