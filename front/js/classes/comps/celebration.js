class Celebration extends Phaser.GameObjects.Container{

    constructor(config){
        super(config.scene);
        this.scene = config.scene;
        if(!config.color)
            config.color = 0xB833FF;
        if(!config.width)
            config.width = game.config.width*0.5 ;
        if(!config.height)
            config.height = game.config.height*0.5;  
        if(!config.playerNum)
            config.playerNum = "";  
        this.config = config;

        this.graphics = this.scene.add.graphics();
        this.AddBackground();
        this.AddMessage();
        this.PutButton();
        this.scene.add.existing(this);

        this.callBackFcn = null; 
        this.x = game.config.width/2 - this.config.width/2;
        this.y = game.config.height/2 - this.config.height/2;
        
        this.LoadAnimation();
        this.setVisible(false);
    }

    AddBackground(){        
        this.graphics.lineStyle(3, 0x000000);
        this.graphics.fillStyle(this.config.color, 1);//color, transparency
        this.graphics.fillRect(0,0, this.config.width, this.config.height);
        this.graphics.strokeRect(0,0, this.config.width, this.config.height);    
        this.add(this.graphics);            
    }   

    AddMessage(){        
        this.message1 = this.scene.add.text(this.config.width*0.5, this.config.height*0.1, "¡En hora buena!", {fontFamily: 'Anton', color:'white', fontSize:30});
        this.message1.setOrigin(0.5,0.5);  
        let msg = `El jugador ${this.config.playerNum} ha pasado a la siguiente etapa`;
        this.message2 = this.scene.add.text(this.config.width*0.5, this.config.height*0.25, msg, {fontFamily: 'Anton', color:'black', fontSize: '40px', align: 'center' 
                            , wordWrap: { width: this.config.width *0.7 }});                   
        this.message2.setOrigin(0.5,0.5);  
        this.add(this.message1);
        this.add(this.message2);        
    }

    LoadAnimation(){
        this.gif = this.scene.add.sprite(this.config.width*0.5, this.config.height*0.6, "celeb");
        this.gif.setOrigin(0.5,0.5);  
        this.add(this.gif);
        
		let frameNames = this.scene.anims.generateFrameNumbers('celeb');
		this.anim = this.scene.anims.create({
			key: 'celebrateAnim',
			frames: frameNames, //or walkingImgs			
			frameRate: 7,
			repeat: -1 // -1 to run forever, x number to run x times.
		});        
    }
    
    PlayAnimation(msg1, msg2, callBackFcn){
        this.callBackFcn = callBackFcn;
        if(msg1 != null)
            this.message1.setText(msg1);
        if(msg2 != null)
            this.message2.setText(msg2);        
        this.gif.anims.play('celebrateAnim');
        this.setVisible(true);
    }    

    PutButton(){        
        let textConf = {color:'black', fontSize:20};
        this.okButton = new FlatButton({scene: this.scene, key: 'button1', text: 'Ok', x:this.config.width*0.5, y:this.config.height*0.9, 
            event:'ok_button_pressed', params:null, textConfig: textConf, scale: 0.3
        });
        this.add(this.okButton);
        emitter.on('ok_button_pressed', this.btnOKPressed, this);
    }

    btnOKPressed(){
        console.log("ok celeb");
        this.gif.anims.stop(null, true);
        this.setVisible(false);
        if(this.callBackFcn)
            this.callBackFcn();
    }

}