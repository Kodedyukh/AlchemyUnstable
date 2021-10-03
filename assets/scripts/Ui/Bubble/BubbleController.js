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
        potions: { default: [], type: PotionRenderHelper },
        offset: { default: cc.v2(20, 0), type: cc.Vec2 },
        startPosition: { default: cc.v2(0, 0), type: cc.Vec2 },
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

            const position = cc.v2(this.startPosition.x + this.offset.x * index, this.startPosition.y + this.offset.y * index );
            ingridientNode.setPosition(position);
        });
    },

    onShowBubble() {
        this.node.opacity = 255;
        
        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients)=>{this._setIngridients(ingridients)});
    },

    onHideBubble() {
        this.node.opacity = 0;
    },
});
