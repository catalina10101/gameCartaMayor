class SceneMain extends Phaser.Scene {
    constructor() {
        super('SceneMain'); //same as class name 
    }
    preload()
    {
        //load imgs or sounds        
    }
    create() {
        //define objects        
        //this.CreateScoreBox();
        console.log("Ready!");
        emitter = new Phaser.Events.EventEmitter();
        //this.DrawGrid();    
        //this.PutButtons();
        let mediaManager = new MediaManager({scene: this});
        //mediaManager.setBackgroundMusic('backgroundMusic');
        this.handSize = 6;
        this.cardDepth = 100;
        this.upperMargin = game.config.height*0.05;       
        //this.pozo = {x: Math.floor(this.play1_cardContainer.boxWidth/2), y: Math.floor(game.config.height/2 - this.upperMargin) };//card container related        
        this.pozo = {x: game.config.width/2 - G.CARD_WIDTH/2 , y: game.config.height/2 - G.CARD_HEIGHT/2 };
        this.deck = new CardDeck({scene:this});

        this.play1_cardContainer = new CardContainer({scene: this, size: this.handSize});
        this.ConfigCardContainer(this.play1_cardContainer, game.config.width/2 - this.play1_cardContainer.boxWidth/2, this.upperMargin);

        this.play2_cardContainer = new CardContainer({scene: this, size: this.handSize});
        this.ConfigCardContainer(this.play2_cardContainer, game.config.width/2 - this.play2_cardContainer.boxWidth/2, game.config.height - this.upperMargin - this.play1_cardContainer.cardSpaceHeight);

        this.playedCards = []; //this.add.group();      
        this.PutPlayCardButton();
        this.PutTakeCardsButton();

        this.playerTurnTxt = this.add.text(game.config.width*0.2, game.config.height*0.45, "Player 1's turn", {color:'white', fontSize:30});
        this.cardAmountTxt = this.add.text(game.config.width*0.2, game.config.height*0.55, "Card Amount: 0", {color:'white', fontSize:30});        
        this.errorTxt = this.add.text(game.config.width*0.6, game.config.height/2, "Error", {color:'red', fontSize:30, wordWrap: { width: model.isMobile==true? 180 : 230 }});
        this.errorTxt.setOrigin(0,0.5);
        this.errorTxt.scale = 0;
        let sb = new SoundButtons({scene: this});
        
        this.movedCards = 0;

        this.gameModel = {
            turn: 'player1',
            pozoHighestCard: 0,
        };
    }
    update() {
		//this is running constantly.
    }
    //containers
    ConfigCardContainer = (container, x, y) =>{
        container.x = x;
        container.y = y;
        
        let cards = this.deck.TakeCards(this.handSize);
        //container.RefillContainer(cards);
        container.InsertCards(cards, true);
    }
    ///button: TAKE CARDS
    PutTakeCardsButton(){        
        let textConf = {color:'black', fontSize:30};
        this.applyButton = new FlatButton({scene: this, key: 'button1', text: 'Take cards', x:game.config.width*0.85, y: game.config.height*0.6, 
            event:'take_button_pressed', params:null, textConfig: textConf, scale: 0.8
        });
        emitter.on('take_button_pressed', this.TakeCards, this);
    }

    TakeCards(){
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer;
        container.InsertCards(this.playedCards, false);
        this.playedCards = [];    
        this.gameModel.pozoHighestCard = 0;
        this.ChangeTurn();
    }
    ///button: PLAY CARD
    PutPlayCardButton(){        
        let textConf = {color:'black', fontSize:30};
        this.applyButton = new FlatButton({scene: this, key: 'button1', text: 'Play card', x:game.config.width*0.85, y: game.config.height*0.4, 
            event:'play_button_pressed', params:null, textConfig: textConf, scale: 0.8
        });
        emitter.on('play_button_pressed', this.PlayButtonPressed, this);
    }

    PlayButtonPressed(params){
        //console.log(params);
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer;
        this.selectedCards =  container.GetSelectedCards();//container.handCards.find(x=> {return x.isSelected===true});
        //console.log(this.selectedCard);
        let ok = this.ValidateCards(this.selectedCards);
        if(ok){
            //this.playedCards.add(this.selectedCard);
            this.selectedCards.forEach(card=>{
                container.RemoveCard(card);
                this.playedCards.push(card);            
                let nextDepth = this.GetNextCardDepth();
                card.depth = nextDepth;//show card on top. //this.selectedCard.bringToTop();
                this.tweens.add({targets: card, duration: 1000, 
                    x: this.pozo.x,
                    y: this.pozo.y,
                    depth: nextDepth,            
                    onComplete: this.cardMoved,
                    callbackScope: this
                });        
            });
        }
        // this.selectedCards.forEach(c=> {
        //     let params = c.config.params;
        //     console.log(params);
        //     switch(c.config.params.function){
        //         case 'translate': Transform.TranslateInGrid(this.face, params.x, params.y, this.alignGrid); break;
        //         case 'rotate': Transform.Rotate(this, this.face, params.angle); break;
        //     }
        //     //this.time.addEvent({ delay: G.TWEEN_TIME, callback: , callbackScope: this, loop: true });
        //     this.cardContainer.RemoveCard(c);
        //     //Transform.transform(c.config.params);
        // });
        // this.time.addEvent({ delay: G.TWEEN_TIME, callback: this.RefillHand, callbackScope: this, loop: false });
        //this.scene.start('SceneOver');
    }    

    ValidateCards(selectedCards){
        console.log("sel cards", selectedCards);
        let ok = true;
        if(selectedCards.length == 0){
            this.errorTxt.setText("Please select a card ");
            this.errorTxt.scale = 1;
            ok =  false;
        }
        if(ok == false) return false;
         
        let cardsNum = selectedCards[0].number;
        selectedCards.forEach(c=>{
            if(c.number != cardsNum){
                this.errorTxt.setText("All cards must have the same value/number.");
                this.errorTxt.scale = 1;
                ok =  false;
            }
        });
        if(cardsNum < this.gameModel.pozoHighestCard){
            this.errorTxt.setText("You must choose a card equal or higher than " + this.gameModel.pozoHighestCard);
            this.errorTxt.scale = 1;
            ok = false;            
        }

        if(ok === true)
        {
            this.gameModel.pozoHighestCard = cardsNum;
            this.errorTxt.scale = 0;
            return true;
        }
        else 
            return false;
    }

    cardMoved(){
        console.log("cards Moved");   
        this.movedCards ++;
        if(this.movedCards >= this.selectedCards.length) { 
            this.movedCards = 0;
            let burn = this.isABurn();
            if(burn === true){
                this.errorTxt.setText("4 of same number, you burn them all! and put new cards");
                this.errorTxt.scale = 1;
                this.BurnCards();
            }
            else 
                this.ChangeTurn();       
        }
    }

    isABurn(){
        // 4 of same number, you burn them all!
        let isBurn = false;
        let pozoCardsNums = [...this.playedCards.map(c=> c.number)];
        console.log(pozoCardsNums);
        if(pozoCardsNums.length >= 4){
            let latest4 = pozoCardsNums.slice(pozoCardsNums.length-4, pozoCardsNums.length);
            console.log("latest4", latest4);
            isBurn = (latest4[0] === latest4[1] && latest4[0] === latest4[2] && latest4[0] === latest4[3] );
        }
        return isBurn;
    }

    BurnCards(){
        this.movedCards = 0;
        this.playedCards.forEach(card=>{
            this.tweens.add({targets: card, duration: 2000, 
                scaleX: 0,
                scaleY: 0,                      
                onComplete: this.CardsBurned,
                callbackScope: this
            });     
        });
    }

    CardsBurned(){
        this.movedCards ++;
        let cardsNum = this.playedCards.length;
        if(this.movedCards >= cardsNum){
            for(let i=0; i< cardsNum; i++){
                this.playedCards[i].destroy;
            }            
            this.playedCards = [];
            this.gameModel.pozoHighestCard = 0;
        }
    }

    ChangeTurn(){
        this.gameModel.turn = this.gameModel.turn == 'player1'? 'player2' : 'player1';
        this.playerTurnTxt.setText( this.gameModel.turn + "'s turn");
        this.cardAmountTxt.setText("Card Amount: " + this.playedCards.length);
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer;        
        //let playerCardNums = container.handCards.map(x=> {return x.number});
        if(!container.HasCardGreaterThan(this.gameModel.pozoHighestCard)){
            this.errorTxt.setText("Sorry, you don't have any card you can play, you'll have to take the played cards.");
            this.errorTxt.scale = 1;
        }
        else
            this.errorTxt.scale = 0;
    }

    RefillHand(){
        let cards = this.deck.TakeCards(this.selectedCards.length);
        this.cardContainer.RefillContainer(cards);
        this.selectedCards = [];
    }

    GetNextCardDepth = () => {
        return this.cardDepth++;
    }
    
}