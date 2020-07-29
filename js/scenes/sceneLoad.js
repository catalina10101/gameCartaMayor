class SceneLoad extends Phaser.Scene {
    constructor() {
        super('SceneLoad'); //same as class name 
    }
    preload(){
        this.bar = new Bar({scene: this, x:game.config.width/2, y:game.config.height/2});
        this.progText = this.add.text(game.config.width/2,game.config.height/2, "0%", {color:'#ffffff', fontSize: game.config.width/20} );
        this.progText.setOrigin(0.5,0.5);
        this.load.on('progress', this.onProgress, this);

        this.load.image("cardSymbol1", "images/cardSymbol1.png");
        this.load.image("cardSymbol2", "images/cardSymbol2.png");
        this.load.image("cardSymbol3", "images/cardSymbol3.png");
        this.load.image("cardSymbol4", "images/cardSymbol4.png");
        this.load.image("espaldarCarta", "images/espaldarCarta.jpg");
        this.load.image("button1", "images/ui/buttons/2/1.png");
        this.load.image("button2", "images/ui/buttons/2/5.png");
        // this.load.audio('cat', ["audio/meow.mp3","audio/meow.ogg"]);
        // this.load.audio('backgroundMusic', ["audio/background.mp3","audio/background.ogg"]);

        this.load.image('toggleBack', "images/ui/toggles/1.png");
        this.load.image('sfxOff', "images/ui/icons/sfx_off.png");
        this.load.image('sfxOn', "images/ui/icons/sfx_on.png");
        this.load.image('musicOn', "images/ui/icons/music_on.png");
        this.load.image('musicOff', "images/ui/icons/music_off.png");
    }
    create(){
        this.scene.start("SceneMain");//SceneTitle
    }

    onProgress(value){
        console.log(value);
        this.bar.setPercent(value);
        let per = Math.floor(value*100);
        this.progText.setText(per + "%");
    }
}