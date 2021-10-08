cc.Class({
    extends: cc.Component,

    properties: {
        fromNode: {
            default: null,
            type: cc.Node,
        },

        toNode: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    update(dt) {
        if (this.fromNode && this.toNode) {
            const globalFromNodePos = this.fromNode.convertToWorldSpaceAR(cc.v2());
            const localFromNodePos = this.node.parent.convertToNodeSpaceAR(globalFromNodePos);

            const globalToNodePos = this.toNode.convertToWorldSpaceAR(cc.v2());
            const localToNodePos = this.node.parent.convertToNodeSpaceAR(globalToNodePos);

            this.node.setPosition(localFromNodePos);

            const toVec = localToNodePos.sub(localFromNodePos);
            const distance = toVec.mag();
            const angle = (Math.atan2(toVec.y, toVec.x) / Math.PI) * 180;

            this.node.angle = angle;
            this.node.width = distance / this.node.scaleX - this.toNode.width / 2;
        }
    },

    // update (dt) {},
});
