import GameEvent from 'GameEvent';
import AudioTypes from 'AudioTypes';
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
        _unstableTimer: { default: 0, serializable: false },
        _particleSystem: { default: null, serializable: false },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._particleSystem = this.getComponentInChildren(cc.ParticleSystem);
        if (this._particleSystem) {
            //this._particleSystem.resetSystem();
            cc.log('reset particle system')
        }

        this._handleSubscription(true);
        this.node.active = this.orders.length > 0;
    },

    start () {
    },

    update (dt) {
        if (this._isUnstable) {
            this._unstableTimer -= dt;
            if (this._unstableTimer < 0) {
                cc.systemEvent.emit(GameEvent.POTION_WASTED, this._currentOrder);
                cc.systemEvent.emit(GameEvent.HP_MINUS);
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.BenchExplosion);

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
        const deliveredPotionType = initiator.getPotionType();

        initiator.setPotionType(PotionTypes.None);
        initiator.interactionAreas = initiator.interactionAreas.filter(a => a !== this);

        if (!this._isUnstable) {
            const targetIngredient = this.orders[this._currentOrder].ingridients.find(i => !i._isDelivered);
            if (deliveredPotionType !== targetIngredient.potionType) {
                this._isUnstable = true;
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.BottleScratch);
                cc.log('potion is unstable');
            } else {
                targetIngredient._isDelivered = true;

                this.scheduleOnce(() => {
                    cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.PutBottle);
                }, .2);

                this.instantInteract();
                this._checkCurrentOrder();
            }
        } else {
            if (deliveredPotionType === PotionTypes.Extra) {
                this._isUnstable = false;
                cc.log('potion is stable');
            }
        }
    },

    instantInteract() {
        const currentOrder = this.orders[this._currentOrder];
        const deliveredIngredients = currentOrder.ingridients.filter(i => i._isDelivered);

        if (deliveredIngredients.length) {
            cc.systemEvent.emit(GameEvent.SHOW_BUBBLE, this.node.position, deliveredIngredients, cc.v2(50, 0));
        }
    },

    stopInstantInteract() {
        cc.systemEvent.emit(GameEvent.HIDE_BUBBLE);
    },

	_handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.GET_CURRENT_ORDER, this.onGetCurrentOrder, this);
		cc.systemEvent[func](GameEvent.GET_CURRENT_ORDER_INDEX, this.onGetCurrentOrderIndex, this);
		cc.systemEvent[func](GameEvent.ORDER_OUT_OF_TIME, this.onOrderOutOfTime, this);
	},

    _checkCurrentOrder(fail = false) {
        const currentOrder = this.orders[this._currentOrder];
        if (currentOrder.ingridients.filter(i => !i._isDelivered).length === 0 || fail) {
            if (!fail) {
                cc.systemEvent.emit(GameEvent.POTION_IS_READY);
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.Fanfare);
                this.stopInstantInteract();
            }
            
            if (++this._currentOrder >= this.orders.length) {
                this._generateNewOrder();
            }
        } else {
            if (Math.random() * 100 < this.unstableChance) {
                this._isUnstable = true;
                cc.systemEvent.emit(GameEvent.PLAY_AUDIO, AudioTypes.BottleScratch);
                this.stopInstantInteract();
                cc.log('potion is unstable');
            }
        }
        cc.log('current order', this._currentOrder);
    },

    _generateNewOrder() {
        const ingredientsCount = this.orders.slice(-1)[0].ingridients.length + 1;
        this.orders.push(new Recipe());

        const potionNames = Object.keys(PotionTypes).filter(key => !['None', 'Extra', 'Result'].includes(key));

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
    },

    onGetCurrentOrderIndex(callback) {
        callback instanceof Function && callback(this._currentOrder);
    }, 
    
    onOrderOutOfTime() {
        if (++this._currentOrder >= this.orders.length) {
            this._generateNewOrder();
        }
    }
});
