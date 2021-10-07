cc.Class({
    extends: cc.Component,

    properties: {
        dynamic: {
            default: true,
            notify() {
                if (!this.dynamic) {
                    this.custom = false;
                }
            },
        },
        zIndex: {
            default: 0,
            visible() {
                return !this.dynamic;
            },
        },
        custom: {
            default: false,
            visible() {
                return this.dynamic;
            },
        },
        targetNode: {
            default: null,
            type: cc.Node,
            visible() {
                return this.custom;
            },
        },
        offset: {
            default: 0,
            visible() {
                return this.custom;
            },
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {},

    update(dt) {
        if (this.custom) {
            const target = this.targetNode || this.node;
            this.node.zIndex = -(target.parent.convertToWorldSpaceAR(target).y + this.offset);
        } else {
            this.node.zIndex = this.dynamic ? -(this.node.parent.convertToWorldSpaceAR(this.node).y - this.node.height / 2) : this.zIndex;
        }
    },
});
