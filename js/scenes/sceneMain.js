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
        this.hellStage = 2;
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
        console.log("this.play1_cardContainer", this.play1_cardContainer);
        this.player1_stage = this.add.text(game.config.width/2 - this.play1_cardContainer.boxWidth/2 -100, game.config.height*0.15, "E 1", {color:'white', fontSize:30});
        this.player2_stage = this.add.text(game.config.width/2 - this.play1_cardContainer.boxWidth/2 -100, game.config.height*0.8, "E 1", {color:'white', fontSize:30});
        let sb = new SoundButtons({scene: this});
        
        this.movedCards = 0;

        this.gameModel = {
            turn: 'player1',
            pozoHighestCard: 0,
            player1:{
                stage: 1
            },
            player2:{
                stage: 1
            }
        };

        this.celebration = new Celebration({scene:this});
    }
    update() {
		//this is running constantly.
    }
    //containers
    ConfigCardContainer = (container, x, y) =>{
        container.x = x;
        container.y = y;
        
        let cards = this.deck.TakeCards(this.handSize);        
        container.InsertCards(cards, true, true);
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
        container.InsertCards(this.playedCards, false, true);
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
                // if(card.showFront === false)
                //     card.ShowFront();
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
        let playerModel = this.gameModel.turn == 'player1'? this.gameModel.player1 : this.gameModel.player2;
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer;   
        if(selectedCards.length == 0){
            this.errorTxt.setText("Please select a card ");
            this.errorTxt.scale = 1;
            ok =  false;
        }
        else if(selectedCards.length > 1 && playerModel.stage == this.hellStage && container.allCardsHidden == true){
            this.errorTxt.setText("You can only select one hidden card at a time.");
            this.errorTxt.scale = 1;
            ok =  false;
        }
        if(ok == false) return false;
        
        let cardsNum = selectedCards[0].number;
        if(playerModel.stage < this.hellStage || container.allCardsHidden == false){            
            selectedCards.forEach(c=>{
                if(c.number != cardsNum){
                    this.errorTxt.setText("All cards must have the same value/number.");
                    ok =  false;
                }
            });
            if(cardsNum < this.gameModel.pozoHighestCard){
                this.errorTxt.setText("You must choose a card equal or higher than " + this.gameModel.pozoHighestCard);
                ok = false;            
            }
        }
        else{
            selectedCards[0].ShowFront();
            if(cardsNum < this.gameModel.pozoHighestCard)
            {
                this.errorTxt.setText("Bad luck! it's a lower number, you'll have to take the cards. ");                
                ok = false; 
            }
        }

        if(ok === true)
        {
            this.gameModel.pozoHighestCard = cardsNum;
            this.errorTxt.scale = 0;
            return true;
        }
        else {
            this.errorTxt.scale = 1;
            return false;
        }
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
            else {
                this.CheckStageCompleted(true);                    
            }
        }
    }

    ChangeTurn(){
        this.gameModel.turn = this.gameModel.turn == 'player1'? 'player2' : 'player1';
        this.playerTurnTxt.setText( this.gameModel.turn + "'s turn");
        this.cardAmountTxt.setText("Card Amount: " + this.playedCards.length);
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer;      
        let playerModel = this.gameModel.turn == 'player1'? this.gameModel.player1 : this.gameModel.player2;              
        //let playerCardNums = container.handCards.map(x=> {return x.number});
        if(playerModel.stage <this.hellStage && !container.HasCardGreaterThan(this.gameModel.pozoHighestCard)){
            this.errorTxt.setText("Sorry, you don't have any card you can play, you'll have to take the played cards.");
            this.errorTxt.scale = 1;
        }
        else
            this.errorTxt.scale = 0;
    }

    /*********
     *  BURN CARDS
     *********/
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
            this.CheckStageCompleted(false);
        }
    }

    /*********
     *  STAGE HANDLING
     *********/
    CheckStageCompleted(changeTurnAfter){
        let container = this.gameModel.turn == 'player1'? this.play1_cardContainer : this.play2_cardContainer; 
        let handCards = container.GetAllCards();
        let toshow = handCards.map(x=> {return { n: x.number, showFront: x.showFront } });
        console.log("rem cards: ", this.gameModel.turn, toshow);
        let playerModel = this.gameModel.turn == 'player1'? this.gameModel.player1 : this.gameModel.player2;
        if(handCards.length == 0){            
            playerModel.stage = playerModel.stage + 1;
            if(playerModel.stage === this.hellStage+1){
                model.winner = this.gameModel.turn;
                this.CelebrateGameWin();
                //this.scene.start("SceneOver");
            }
            else {
                let stageTxt = this.gameModel.turn == 'player1'? this.player1_stage : this.player2_stage;
                stageTxt.setText("E " + playerModel.stage);
                this.CelebrateNextStage();
                this.RefillHand(container, playerModel.stage);
            }
        }
        if(playerModel.stage === this.hellStage){
            container.showHidden();
        }

        if(changeTurnAfter)
            this.ChangeTurn();   
    }

    RefillHand(container, stage){
        let cards = this.deck.TakeCards(this.handSize);        
        container.InsertCards(cards, true, stage < this.hellStage);
    }

    CelebrateNextStage() {
        let msg1 = "Well Done!";
        let playerNum = this.gameModel.turn == 'player1'? 1: 2;
        let msg2 = `Player ${playerNum} has reached the next level`;        
        this.celebration.PlayAnimation(msg1, msg2, this.OnNextStageCelebrationFinished);
        this.celebration.depth = this.GetNextCardDepth();
    }

    CelebrateGameWin(){
        let msg1 = "Congratulations!";
        let playerNum = this.gameModel.turn == 'player1'? 1: 2;
        let msg2 = `Player ${playerNum} has won the game`;        
        this.celebration.PlayAnimation(msg1, msg2, this.OnNextGameWonCelebrationFinished);
        this.celebration.depth = this.GetNextCardDepth();
    }

    OnNextStageCelebrationFinished = () =>{
        console.log("OnNextStageCelebrationFinished");
    }

    OnNextGameWonCelebrationFinished = () =>{
        console.log("OnNextGameWonCelebrationFinished");
        this.scene.start("SceneOver");
    }
    /*********
     *  other
     *********/

    GetNextCardDepth = () => {
        return this.cardDepth++;
    }
    
}