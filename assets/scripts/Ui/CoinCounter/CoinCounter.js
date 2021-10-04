import GameEvent from 'GameEvent';

cc.Class({
    extends: cc.Component,

    properties: {
        _counter: { default: 0, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:


    onLoad () {
        this._handleSubscription(true);
    },

    start () {

    },

    // update (dt) {},

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.ORDER_COMPLITED, this.onOrderComplited, this);
	},

    onOrderComplited() {
        this._counter++;

        const countStr = this._counter.toString();
        const numsArray = new Array(3 - countStr.length).fill(0).concat(countStr.split('').map(ch => +ch));
        numsArray.forEach((ch, i) => {
            const holder = this.node.children[i].getChildByName('Holder');
            cc.tween(holder).to(1, { y: ch * 60 }).start();
        })
    }

});
