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

        coverMode: { default: false, visible: false },

        _coverData: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {},

    update(dt) {
        if (!this.coverMode) {
            if (this.custom) {
                const target = this.targetNode || this.node;
                this.node.zIndex = -(target.parent.convertToWorldSpaceAR(target).y + this.offset);
            } else {
                this.node.zIndex = this.dynamic
                    ? -(this.node.parent.convertToWorldSpaceAR(this.node).y - this.node.height / 2)
                    : this.zIndex;
            }
        }

        if (this._coverData && this._coverData.node) {
            this._coverData.node.zIndex = this.node.zIndex - 1;
        }
    },

    setCoverMode(isActive, coverNode) {
        if (!isActive) {
            if (this._coverData instanceof Object) {
                if (this._coverData.hasOwnProperty('zIndex')) {
                    this._coverData.node.zIndex = this._coverData.zIndex;
                } else {
                    this._coverData.helper.coverMode = false;
                }
                this._coverData = null;
            }
        } else {
            const coverHelper = coverNode.getComponent('DeepSortHelper');
            if (coverHelper) {
                coverHelper.coverMode = true;
                this._coverData = {
                    node: coverNode,
                    helper: coverHelper,
                };
            } else {
                this._coverData = {
                    node: coverNode,
                    zIndex: coverNode.zIndex,
                };
            }
        }
    },
});
