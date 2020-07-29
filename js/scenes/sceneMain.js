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
        this.cardContainer = new CardContainer({scene: this, size: this.handSize});
        this.cardContainer.x = game.config.width/2 - this.cardContainer.boxWidth/2;
        this.cardContainer.y = this.upperMargin;
        this.pozo = {x: Math.floor(this.cardContainer.boxWidth/2), y: Math.floor(game.config.height/2 - this.upperMargin) };//card container related
        
        this.deck = new CardDeck({scene:this});
        let cards = this.deck.TakeCards(this.handSize);
        this.cardContainer.RefillContainer(cards);
        this.playedCards = this.add.group();      
        this.PutPlayCardButton();

        let sb = new SoundButtons({scene: this});
        
    }
    update() {
		//this is running constantly.
	}
    ///buttons
    PutPlayCardButton(){        
        let textConf = {color:'black', fontSize:30};
        this.applyButton = new FlatButton({scene: this, key: 'button1', text: 'Play card', x:game.config.width*0.85, y: game.config.height*0.4, 
            event:'play_button_pressed', params:null, textConfig: textConf, scale: 0.8
        });
        //let flatButton2 = new FlatButton({scene: this, key: 'button2', text: 'Destruct!', x:240, y: 300, event:'button_pressed', params:'self_destruct'});
        //Align.scaleToGameW(this.applyButton, 0.1);
        emitter.on('play_button_pressed', this.PlayButtonPressed, this);
    }

    PlayButtonPressed(params){
        //console.log(params);
        this.selectedCard = this.cardContainer.handCards.find(x=> {return x.isSelected===true});
        console.log(this.selectedCard);
        //this.playedCards.push(this.selectedCard);
        this.playedCards.add(this.selectedCard);
        //this.selectedCard.showAtTop(); //bringToTop();
        let nextDepth = this.GetNextCardDepth();
        this.selectedCard.depth = nextDepth;
        this.selectedCard.bringToTop();
        this.tweens.add({targets: this.selectedCard, duration: 1000, 
            x: this.pozo.x,
            y: this.pozo.y,
            depth: nextDepth
        });        
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

    RefillHand(){
        let cards = this.deck.TakeCards(this.selectedCards.length);
        this.cardContainer.RefillContainer(cards);
        this.selectedCards = [];
    }

    GetNextCardDepth = () => {
        return this.cardDepth++;
    }
    
}