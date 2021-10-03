import GameEvent from 'GameEvent';
import InteractionArea from 'InteractionArea';
import PotionTypes from 'PotionTypes';

const RecipeIngredient = cc.Class({
	name: 'RecipeIngredient',
	properties: {
        potionType: { 
            default: PotionTypes.None,
            type: PotionTypes
        },
        _isDelivered: { default: false, serializable: false }
	},
});

const Recipe = cc.Class({
	name: 'Recipe',
	properties: {
		ingridients: {
            default: [],
            type: RecipeIngredient
        }
	},
});

cc.Class({
    extends: InteractionArea,

    properties: {
        unstableDuration: 60,
        unstableChance: {
            default: 10,
            tooltip: 'в процентах'
        },
        orders: {
            default: [],
            type: Recipe
        },

        _currentOrder: { default: 0, serializable: false },
        _isUnstable: { default: false, serializable: false },
        _unstableTimer: { default: 0, serializable: false }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._handleSubscription(true);
        this.node.active = this.orders.length > 0;
    },

    start () {
    },

    update (dt) {
        if (this._isUnstable) {
            this._unstableTimer -= dt;
            if (this._unstableTimer < 0) {
                cc.systemEvent.emit(GameEvent.POTION_WASTED);
                this._isUnstable = false;
                this._checkCurrentOrder(true);
                cc.log('potion wasted');
            }
        } else {
            if (this._unstableTimer !== this.unstableDuration) {
                this._unstableTimer = this.unstableDuration;
            }
        }
    },

    interact(initiator) {
        const deliveredPotionType = initiator._potion.type;
        if (!this._isUnstable) {
            const targetIngredient = this.orders[this._currentOrder].ingridients.find(i => !i._isDelivered);
            if (deliveredPotionType !== targetIngredient.potionType) {
                this._isUnstable = true;
                cc.log('potion is unstable');
            } else {
                targetIngredient._isDelivered = true;
                this._checkCurrentOrder();
            }
        } else {
            if (deliveredPotionType === PotionTypes.Extra) {
                this._isUnstable = false;
                cc.log('potion is stable');
            }
        }

        initiator.setPotionType(PotionTypes.None);
        initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);
    },

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.GET_CURRENT_ORDER, this.onGetCurrentOrder, this);
	},

    _checkCurrentOrder(next = false) {
        const currentOrder = this.orders[this._currentOrder];
        if (currentOrder.ingridients.filter(i => !i._isDelivered).length === 0 || next) {
            if (++this._currentOrder >= this.orders.length) {
                this._generateNewOrder();
            }
        } else {
            if (Math.random() * 100 < this.unstableChance) {
                this._isUnstable = true;
                cc.log('potion is unstable');
            }
        }
        cc.log('current order', this._currentOrder);
    },

    _generateNewOrder() {
        const ingredientsCount = this.orders.slice(-1)[0].ingridients.length + 1;
        this.orders.push(new Recipe());

        const potionNames = Object.keys(PotionTypes).filter(key => key !== 'None' && key !== 'Extra');

        for (let i = 0; i < ingredientsCount; i++) {
            const potionNameIndex = Math.floor(potionNames.length * Math.random());
            const newIngredient = new RecipeIngredient();
            newIngredient.potionType = PotionTypes[potionNames[potionNameIndex]];
            this.orders[this._currentOrder].ingridients.push(newIngredient);
        }

        cc.log('new order', this.orders);
    },

    // принимает в качестве аргумента функцию обработчик, в которую в свою очередь передается массив
    // элементов в двумя свойствами: potionType (тип данных PotionType) и _isDelivered (тип данных Boolean)
    onGetCurrentOrder(callback) {
        const currentOrder = this.orders[this._currentOrder];
        callback instanceof Function && callback(currentOrder.ingridients);
    }
});
