import PotionTypes from 'PotionTypes';
import GameEvent from 'GameEvent';

const PotionRenderHelper = cc.Class({
    name: 'PotionRenderHelper',

    properties: {
        type: { default: PotionTypes.None, type: PotionTypes },
		spriteFrame: { default: null, type: cc.SpriteFrame }
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        //offset: { default: cc.v2(0, 50) },
        potions: { default: [], type: PotionRenderHelper },
        potionOffset: { default: cc.v2(20, 0) },
        startPosition: { default: cc.v2(0, 0) },

		_ingredientNodes: { default: null, serializable: false }
    },

    onEnable() {
        this._handleSubscription(true);

        this.node.opacity = 0;
    },

    onDisable() {
        this._handleSubscription(false);
    },

    _handleSubscription(isOn) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.SHOW_BUBBLE, this.onShowBubble, this);
        cc.systemEvent[func](GameEvent.HIDE_BUBBLE, this.onHideBubble, this);
    },

    _setIngridients(ingridients) {
        ingridients.forEach((ingridient, index) => {
            const ingridientNode = new cc.Node('Ingridient');            
            const ingridientSprite = ingridientNode.addComponent(cc.Sprite);
            
            const currentPotion = this.potions.find(potion => ingridient.potionType === potion.type);
            ingridientSprite.spriteFrame = currentPotion.spriteFrame;

            ingridientNode.parent = this.node;
            ingridientNode.setScale(0.35);
            ingridientNode.zIndex = 2; 

            const position = cc.v2(this.startPosition.x + this.potionOffset.x * index, this.startPosition.y + this.potionOffset.y * index );
            ingridientNode.setPosition(position);

            this._ingredientNodes.push(ingridientNode);
        });
    },

    onShowBubble(position) {
        this.node.setPosition(position);//.add(this.offset));
        this.node.opacity = 255;
        
        if (this._ingredientNodes) {
            this._ingredientNodes.forEach(node => {
                node.destroy();
            });
        }
        this._ingredientNodes = [];

        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients)=>{this._setIngridients(ingridients)});
    },

    onHideBubble() {
        this.node.opacity = 0;
    },
});
