class Card extends Phaser.GameObjects.Container{

    constructor(config){
        super(config.scene);
        this.scene = config.scene;
        this.isSelected = false;
        this.ID = config.ID;
        this.depth = this.ID +50;
        if(!config.color)
            config.color = 0x333333;
        if(!config.width)
            config.width = G.CARD_WIDTH;
        if(!config.height)
            config.height = G.CARD_HEIGHT;       

        this.config = config;               
        this.number = this.config.number;
        this.showFront = true;
        //center in container
        // this.graphics.x = -config.width/2;
        // this.graphics.y = -config.height/2;

        if(config.x)
            this.x = config.x;
        if(config.y)
            this.y = config.y;
        
        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);
        //this.setSize(this.config.width, this.config.height);        
        //this.scene.add.existing(this);
        // this.setInteractive();
        // this.on('pointerdown', this.cardClicked);
    }
    showAtTop(){
       // this.image.bringToTop();
    }

    ShowFront(){        
        this.showFront = true;
        this.AddImage(this.config.imageKey);   
        this.AddNumber(); 
        this.graphics.lineStyle(5, 0x000000);
        this.graphics.strokeRect(0,0, this.config.width, this.config.height); 
    }

    ShowBack(){
        this.showFront = false;
        this.AddImage("espaldarCarta");          
    }

    cardClicked(){
        console.log("card clicked!");
        this.isSelected =  !this.isSelected;
        let color = this.isSelected? 0x00ff00 : 0x000000;
        this.graphics.lineStyle(5, color);
        this.graphics.strokeRect(0,0, this.config.width, this.config.height);    
        //emitter.emit(G.CARD_CLICKED, {card: this});
    }

    AddBackground(){        
        this.graphics.lineStyle(3, 0x000000);
        this.graphics.fillStyle(this.config.color, 1);//color, transparency
        this.graphics.fillRect(0,0, this.config.width, this.config.height);
        this.graphics.strokeRect(0,0, this.config.width, this.config.height);                
    }   

    AddNumber(){
        this.numberUp = this.scene.add.text(this.config.width*0.5, this.config.height*0.1, this.number, {fontFamily: 'Anton', color:'#000000', fontSize: '40px'});
        this.numberUp.setOrigin(0.5,0.5);  
        this.numberDown = this.scene.add.text(this.config.width*0.5, this.config.height*0.9, this.number, {fontFamily: 'Anton', color:'black', fontSize: '40px'});           
        this.numberDown.angle = 180;
        this.numberDown.setOrigin(0.5,0.5);  
        this.add(this.numberUp);
        this.add(this.numberDown);        
    }

    AddImage(imageKey){
        if(imageKey){
            if(this.image)
                this.image.destroy();
            this.image = this.scene.add.image(0,0, imageKey);
            this.image.setOrigin(0,0);    
            Align.scaleToWidth(this.image, 1, this.config.width);
            this.image.setInteractive();
            this.image.on('pointerdown', this.cardClicked, this);
            this.add(this.image); 
        }
    }

    Delete(){
        this.scene.tweens.add({targets: this, duration: 2000, 
            scaleX: 0,
            scaleY: -1
        });
        //this.destroy;
    }

    static GetCardsString(cards) {
        let cardsStr =  cards.map(x=> {           
            if(x == null)
                return "empty";

            let pinta ="";
            switch(x.config.imageKey){
                case "cardSymbol1": pinta = "corazones"; break;
                case "cardSymbol2": pinta = "picas"; break;
                case "cardSymbol3": pinta = "trebol"; break;
                case "cardSymbol4": pinta = "diamantes"; break;
                default: pinta = "unknown"; break;
            }
            return x.number + " de " + pinta + ":" + x.ID;
        });
        return cardsStr;
    }
}