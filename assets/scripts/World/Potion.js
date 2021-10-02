import CollisionGroups from 'CollisionGroups';
import InteractionArea from 'InteractionArea';

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onBeginContact(contact, self, other) {
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
				this.holder.potion = null;
                this.node.active = false;
			} break;
		}
	},

    onEndContact(contact, self, other) {
		const otherGroupName = other.node.group;
		switch(otherGroupName){
			case CollisionGroups.Bench: {
                const interact = other.node.getComponent(InteractionArea);
                this.holder.interactionAreas = this.holder.interactionAreas.filter(a => a !== interact);
			} break;
		}
	},
});
