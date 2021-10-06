cc.Class({
    extends: cc.Component,

    properties: {
        indicator: {
            default: null,
            type: cc.Node,
        },
        render: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad() {
        cc.loader.onProgress = (completedCount, totalCount, item) => {
            var percent = 0;
            if (totalCount > 0) {
                percent = (100 * completedCount) / totalCount;
            }
            this.render.width = Math.round(percent) * 2;
            this.indicator.x = -100 + Math.round(percent) * 2;
        };
    },

    // update (dt) {},
});
