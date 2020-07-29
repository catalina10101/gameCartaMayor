class CardContainer extends Phaser.GameObjects.Container {

    constructor(config){
        super(config.scene);
        this.scene = config.scene;

        if(!config.size)
            config.size = 6; //number of cards to contain
        if(!config.backGroundColor)
            config.backGroundColor = 0xeeeeee;
        if(!config.borderColor)
            config.borderColor = 0xdddddd;
        
        this.cardMargin = 0.3;
        this.cardSpaceWidth = G.CARD_WIDTH * (1+this.cardMargin);
        this.cardSpaceHeight = G.CARD_HEIGHT * (1+this.cardMargin);       
        this.size = config.size;
        this.boxWidth = this.cardSpaceWidth*this.size;
        this.config = config;

        this.handCards = [];
        this.handCards.length = this.size;        
        this.DrawContainerBox();
        this.scene.add.existing(this);
        emitter.on(G.CARD_CLICKED, this.onCardClicked, this);
    }

    onCardClicked(params){
        let card = params.card;        
        if(card.isSelected){//unselect other cards
            this.handCards.forEach(c=> {
                if(c.ID != card.ID && c.isSelected)
                c.cardClicked();
            });
        }
    }

    DrawContainerBox(){
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(3, this.config.borderColor);
        this.graphics.fillStyle(this.config.backGroundColor, 1);//color, transparency
        this.graphics.fillRect(0,0, this.boxWidth, this.cardSpaceHeight);
        this.graphics.strokeRect(0,0, this.boxWidth, this.cardSpaceHeight);        
        this.add(this.graphics);
    }    

    AddCard(card, index){
        //animation: from image deck to position in hand.
        this.handCards[index] = card;
        this.add(card);
        card.x = this.cardSpaceWidth*index + G.CARD_WIDTH*this.cardMargin/2;
        card.y = G.CARD_HEIGHT* this.cardMargin/2;
        //card.setOrigin(0.5, 0.5);                
        card.ShowFront();
    }

    RemoveCard(card){
        card.Delete();
        let cardIDs = this.handCards.map(c=> c.ID);
        let idx = cardIDs.indexOf(card.ID);
        this.handCards[idx] = null;
    }

    RefillContainer(cardsArr){
        for(let i =0; i< this.size; i++){
            if( (this.handCards[i] == undefined || this.handCards[i] == null) && cardsArr.length > 0){
                let card =  cardsArr.pop();
                this.AddCard(card, i);
            }
        }
    }
    
}