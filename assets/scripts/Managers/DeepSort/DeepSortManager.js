const DeepSortObject = cc.Class({
    name: 'DeepSortObject',
    properties: {
        node: { default: null, type: cc.Node },
        getChildren: false,
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        objects: { default: [], type: DeepSortObject },

        _nodes: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._nodes = [];
        this.objects.forEach((o) => {
            if (o.getChildren) {
                while (o.node.children.length > 0) {
                    this._moveNode(o.node.children[0]);
                }
            } else {
                this._moveNode(o.node);
            }

            this._nodes.push(o.node);
        });
    },

    start() {},

    _moveNode(node) {
        const worldPosition = node.parent.convertToWorldSpaceAR(node);
        node.setParent(this.node);
        node.setPosition(this.node.convertToNodeSpaceAR(worldPosition));
        node.zIndex = -Math.round(worldPosition.y - node.height / 2); // * (node.angle === 0 ? 1 : -1));
    },

    // update (dt) {},
});
