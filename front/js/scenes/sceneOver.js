class SceneOver extends Phaser.Scene {
    constructor() {
        super('SceneOver');
    }
    preload()
    {
        this.load.image("title", "images/title.png");
        this.load.image("button1", "images/ui/buttons/2/1.png");
        this.load.image("button2", "images/ui/buttons/2/5.png");
    }
    create() {        

        console.log("SceneTitle!");
        this.alignGrid = new AlignGrid({rows:11, cols:11, scene: this});
        //this.alignGrid.showNumbers();

        let title = this.add.image(0,0, 'title');
        this.alignGrid.placeAtIndex(27, title);
        Align.scaleToGameW(title, 0.8);

        //let winner = "WINNER: " + (model.winner == 'player1'? 'Player 1' : 'Player 2');
        this.winnerMsg = this.add.text(0,0, model.SceneOverCustomMsg, {color: '#ffffff', fontSize:80, fontWeight: 'bold',
            stroke : '#ffffff',
            strokeThickness : 5,
            fill : '#EB12F5',
        });
        this.winnerMsg.setOrigin(0.5,0.5);
        this.alignGrid.placeAtIndex(60, this.winnerMsg);

        // let btnStart = new FlatButton({scene: this, key: 'button1', text:'Play Again', event:'start_game' });
        // this.alignGrid.placeAtIndex(93, btnStart);

        // emitter.on('start_game', this.startGame, this );
    }
    update() {}

    startGame(){
        this.scene.start('SceneMain');
    }
}