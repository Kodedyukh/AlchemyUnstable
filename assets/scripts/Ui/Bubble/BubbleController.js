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

		graphics: { default: null, type: cc.Graphics },
		shadowGraphics: { default: null, type: cc.Graphics },

		_ingredientNodes: { default: null, serializable: false },
    },

    onEnable() {
        this._handleSubscription(true);

        //this.node.opacity = 0;
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

    _drawGraphics() {
        this.graphics.clear();
        this.shadowGraphics.clear();

        if (this._ingredientNodes.length) {
            const padding = 5;
            const potionNode = this._ingredientNodes[0];
            const semiHeight = potionNode.height / 2 * potionNode.scaleY + padding;
            const semiWidth = potionNode.width / 2 * potionNode.scaleX + padding;
            const bubbleWidth = (this._ingredientNodes.length * semiWidth + this.potionOffset.x) - this.potionOffset.x;
            const rad = Math.PI / 180;

            this.graphics.moveTo(0, this.startPosition.y - semiHeight * 2);
            this.shadowGraphics.moveTo(0, this.startPosition.y - semiHeight * 2);

            this._drawLine(5, this.startPosition.y - semiHeight);
            
            
            this._drawLine(-semiWidth + padding, this.startPosition.y - semiHeight);
            this._drawLine(-semiWidth + padding / 3, this.startPosition.y - semiHeight + padding / 3);
            this._drawLine(-semiWidth, this.startPosition.y - semiHeight + padding);
            
            this._drawLine(-semiWidth, this.startPosition.y + semiHeight - padding);
            this._drawLine(-semiWidth + padding / 3, this.startPosition.y + semiHeight - padding / 3);
            this._drawLine(-semiWidth + padding, this.startPosition.y + semiHeight);
            
            this._drawLine(bubbleWidth + semiWidth - padding, this.startPosition.y + semiHeight);
            this._drawLine(bubbleWidth + semiWidth - padding / 3, this.startPosition.y + semiHeight - padding / 3);
            this._drawLine(bubbleWidth + semiWidth, this.startPosition.y + semiHeight - padding);
            
            this._drawLine(bubbleWidth + semiWidth, this.startPosition.y - semiHeight + padding);
            this._drawLine(bubbleWidth + semiWidth - padding / 3, this.startPosition.y - semiHeight + padding / 3);
            this._drawLine(bubbleWidth + semiWidth - padding, this.startPosition.y - semiHeight);

            this._drawLine(20, this.startPosition.y - semiHeight);

            this.graphics.lineTo(0, this.startPosition.y - semiHeight * 2);
            this.shadowGraphics.lineTo(0, this.startPosition.y - semiHeight * 2);

            this.graphics.stroke();
            this.graphics.fill();

            this.shadowGraphics.stroke();
            this.shadowGraphics.fill();
        }
    },

    _drawLine(x, y) {
        this.graphics.lineTo(x, y);
        this.shadowGraphics.lineTo(x + 5, y - 5);
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

        cc.systemEvent.emit(GameEvent.GET_CURRENT_ORDER, (ingridients)=>{ this._setIngridients(ingridients) });
        this._drawGraphics();
    },

    onHideBubble() {
        this.node.opacity = 0;
    },
});
