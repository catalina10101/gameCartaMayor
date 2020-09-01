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
        
        this.cardMargin = 0.3;//% of margin above and below sumed.
        this.onTopCardMargin = 0.25; //space between a card and the card on top
        this.cardSpaceWidth = G.CARD_WIDTH * (1+this.cardMargin);
        this.cardSpaceHeight = G.CARD_HEIGHT * (1+this.cardMargin);  
        this.rowSize = 3;     
        this.colSize = config.size;
        this.boxWidth = this.cardSpaceWidth*this.colSize;
        this.config = config;
        this.allCards = [];
        this.handCards = [];
        this.allCardsHidden = false;
        this.handCards.length = this.rowSize;        
        for(let i=0; i< this.rowSize;i++){
            this.handCards[i] = [];
            this.handCards[i].length = this.colSize;  
        }
        this.DrawContainerBox();
        this.scene.add.existing(this);
        //emitter.on(G.CARD_CLICKED, this.onCardClicked, this);
    }    

    DrawContainerBox(){
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(3, this.config.borderColor);
        this.graphics.fillStyle(this.config.backGroundColor, 1);//color, transparency
        this.graphics.fillRect(0,0, this.boxWidth, this.cardSpaceHeight);
        this.graphics.strokeRect(0,0, this.boxWidth, this.cardSpaceHeight);        
        this.add(this.graphics);
    }    

    GetSelectedCards(){
        this.row = 0, this.col =-1;
        let selCards = [];
        while( this.row < this.rowSize && this.col<this.colSize){
            let handCard = this.GetNextCard(); 
            if(handCard!= null && handCard!= undefined && handCard.isSelected===true){
                selCards.push(handCard);             
            }            
        }
        return selCards;
    }

    InsertCards(newCards, forFirstTime, showFront){
        //let allCards= this.GetAllCards();
        this.allCards = [].concat(this.allCards, newCards);
        this.allCardsHidden = this.allCards.filter(x=> {return x.showFront === true}).length === 0;
        let allCardsShown = this.allCards.filter(x=> {return x.showFront === false}).length === 0;
        let handCards =[];
        if(this.allCardsHidden ==true || allCardsShown==true)
            handCards = this.allCards;
        else {
            handCards = this.allCards.filter(x=> {return x.showFront === true});
            let hiddenCards =this.allCards.filter(x=> {return x.showFront === false});
            hiddenCards.forEach(x=> { x.setVisible(false); });
        }
        if(allCardsShown && showFront)            
            handCards = handCards.sort(this.SortCards);
        this.handCards[0] = [null, null, null,null, null, null];//clean for stage 3 hidden cards. if player takes 3 cards from pozo, next 3 may keep hidden cards even though they are invisible.
        const cardsNum = handCards.length;
        //let cardPut = false;
        this.row = 0, this.col =-1;
        for(let c =0; c< cardsNum; c++){
            let card =  handCards[c]; //handCards.pop();
            card.depth = c;
            if(card.isSelected)
                card.cardClicked();//for selected eaten cards 
            let handCard = this.GetNextCard(); //get next row & col                         
            this.AddCard(card, this.row, this.col, forFirstTime, showFront);
            // cardPut = false;
            // while(!cardPut && this.row < this.rowSize && this.col<this.colSize) {         
            //     let handCard = this.GetNextCard();       
            //     if( handCard == undefined || handCard == null ){                             
            //         this.AddCard(card, this.row, this.col, forFirstTime);
            //         cardPut = true;       
            //     }
            // }            
        }
        this.allCardsHidden = this.allCards.filter(x=> {return x.showFront === true}).length === 0;
    }

    showHidden(){
        this.allCardsHidden = this.allCards.filter(x=> {return x.showFront === true}).length === 0;
        if(this.allCardsHidden ==true){
            this.allCards.forEach(x=> { x.setVisible(true); });
            this.InsertCards([], false, false);
        }
    }

    SortCards(a, b){
        return b.number - a.number;
    }

    GetAllCards(){
        return this.allCards;
    }

    GetAllHandCards(){
        let allCards=[];
        for(let r=0; r< this.rowSize;r++){
            let rowCards = this.handCards[r].filter(x=> {return x !=undefined && x!=null});
            allCards = [].concat(allCards, rowCards );
        }
        return allCards;
    }

    RemoveCard(card){
        //card.Delete();
        let found = false;
        this.row = 0, this.col =-1;
        while(!found && this.row < this.rowSize && this.col<this.colSize){
            let nextCard = this.GetNextCard();
            if(nextCard!= null && nextCard!= undefined && nextCard.ID == card.ID){
                this.handCards[this.row][this.col] = null;
                found = true;
            }
        }
        let cardIdx = this.allCards.findIndex(x=> x.ID == card.ID);
        this.allCards.splice(cardIdx, 1); 
        this.allCardsHidden = this.allCards.filter(x=> {return x.showFront === true}).length === 0;
        // let cardIDs = this.handCards.map(c=> c.ID);
        // let idx = cardIDs.indexOf(card.ID);
        // this.handCards[idx] = null;
    }

    AddCard(card, row, col, forFirtTime, showFront){
        //animation: from image deck to position in hand.
        this.handCards[row][col] = card;
        //this.add(card);        
        card.x = this.x + this.cardSpaceWidth*col + G.CARD_WIDTH*this.cardMargin/2;
        let cardTopMargin =(G.CARD_HEIGHT* this.cardMargin/2);
        let onTopCardSpace = (G.CARD_HEIGHT* this.onTopCardMargin);
        card.y = this.y + cardTopMargin + (row*onTopCardSpace);//different card rows show a bit lower than former row.
        //card.setOrigin(0.5, 0.5);   
        if(forFirtTime){
            this.scene.add.existing(card);     
            if(showFront === true)        
                card.ShowFront();
            else
                card.ShowBack();
        }
    }

    GetNextCard(){
        this.col++;
        if(this.col >= 6)
        {
            this.row++;
            this.col = 0;    
        }
        let nextCard = this.row < this.rowSize? this.handCards[this.row][this.col] : null;
        //let nextCard = this.handCards[this.row][this.col];
        return nextCard;
    }

    HasCardGreaterThan(number){
        let found = false;
        this.row = 0, this.col =-1;
        while(!found && this.row < this.rowSize && this.col<this.colSize){
            let handCard = this.GetNextCard(); 
            if(handCard!= null && handCard!= undefined && handCard.number >= number){
                found = true;
                return true;                
            }            
        }
        return false;
    }

    // RefillContainer(cardsArr){
    //     for(let i =0; i< this.size; i++){
    //         if( (this.handCards[i] == undefined || this.handCards[i] == null) && cardsArr.length > 0){
    //             let card =  cardsArr.pop();
    //             this.AddCard(card, i);
    //         }
    //     }
    // }
    
}