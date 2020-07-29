class ScoreBox extends Phaser.GameObjects.Container{

    constructor(config){
        super(config.scene);
        this.scene = config.scene;
        //
        this.text1 = this.scene.add.text(0,0,"SCORE:0");
        this.text1.setOrigin(0.5,0.5);
        this.add(this.text1);

        if(config.x){
            this.x = config.x;
        }
        if(config.x){
            this.y = config.y;
        }
        this.text1.setBackgroundColor("#000000");

        this.scene.add.existing(this);
        emitter.on(G.SCORE_UPDATED, this.scoreUpdated, this);
    }

    scoreUpdated(){
        this.text1.setText("SCORE: " + model.score);
    }
}