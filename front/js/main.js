let game;
let model;
let emitter;
let G;
let controller;
let gameid = sessionStorage.getItem('gameid');
window.onload = function (){

    var isMobile = navigator.userAgent.indexOf("Mobile");
    if (isMobile == -1) {
        isMobile = navigator.userAgent.indexOf("Tablet");
    }

    if (isMobile == -1){//not mobile
        var config = {
            type: Phaser.AUTO, //graphics_mode: Canvas, WebGL, AUTO 
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-game', //id of element where you want to load the game in the html.
            scene: [SceneLoad, SceneTitle, SceneMain, SceneOver] //[nameOfScene]  class name not file name.
        };
    }
    else {
        var config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-game',
            scene: [SceneLoad, SceneTitle, SceneMain, SceneOver]
        };
    }
    G = new Constants();
    model = new Model();
    model.isMobile = isMobile;
    game = new Phaser.Game(config);    
    console.log("session storage game id: ", gameid);
}