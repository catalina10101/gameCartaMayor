let ws;
class ServerSocket{

    constructor(){
        this.Initialize();
        this.gameid= null;

        this.TakeCards = this.TakeCards.bind(this);
        this.JoinExistingGame = this.JoinExistingGame.bind(this);
        this.PlayCards = this.PlayCards.bind(this);
        this.GetExistingGames= this.GetExistingGames.bind(this);
    }

    Initialize = () => {
        ws = new WebSocket("ws://localhost:8181");
        var nickname = "";
        ws.onopen = this.OnConnectionOpen; 
        
        ws.onmessage = this.OnMessageHandler;

        ws.onclose = function(e) {              
          console.log("Connection closed");
        }
    }

    OnConnectionOpen = () => {
        this.GetExistingGames();//create or connect to existing
        console.log('Connection to server opened');
    }

    OnMessageHandler = (e) =>{
        var data = JSON.parse(e.data);                
        //console.log("from server: ",data);
        switch(data.operation){
          case 'newgame': 
              this.gameid = data.gameid;
              sessionStorage.setItem('gameid', data.gameid);
              //this.StartGame();              
              //window.location = `http://127.0.0.1:8080/CartaMayor/front/`;
              //wsSend("notification", client_uuid, nickname, JSON.stringify({gameid}));
              break;
          case 'error': this.ShowError(data.message); break;          
          case 'startGame': this.StartGame();break;      
          case 'joingame': model.turn = data.turn ;break;    
          case 'takeCards': this.ReceiveCards(data.message);break;  
          case 'cardsplayed': this.CardsPlayed(data.message);break; 
          case 'player-action': this.ReceivePlayerAction(data.message);break;   
          case 'existingGames': this.ReceiveExistingGames(data.message);break;  
          case 'player-disconnected' : this.PlayerDisconnected(data.message);break;  
        }
    }

    sendMessage(json) {
        let req = JSON.stringify(json);
       if(ws.readyState === WebSocket.OPEN) {
            ws.send(req);
       }
    }

    disconnect() {
      ws.close();
    }
    ///
    CreateNewGame = () => {
        this.sendMessage({
            'operation' : 'newgame'
        });
        model.turn = 'player1';
    }

    JoinExistingGame = (gameid) => {
        this.gameid = gameid;
        sessionStorage.setItem('gameid', gameid);      
        this.sendMessage({
            'operation' : 'joingame',
            'gameid' : gameid
        });
    }

    StartGame = () => {
        $('#phaser-game').css("display", "block");//"visibility", "visible"
        $('.join-game-form').closest('.vertical-center').css("display", "none");
    }

    TakeCards = (quantity) => {
        //console.log("TakeCards gameid",  this.gameid);
        this.sendMessage({
            'operation' : 'takeCards',
            'gameid' : this.gameid,
            'cardNum': quantity
        });
    }

    ReceiveCards = (cardsStr) => {
        let cards = JSON.parse(cardsStr);
        //console.log(cards);        
        emitter.emit("ReceiveCards", cards);
    }

    PlayCards = (playedCardsModel) => {
        this.sendMessage({
            'operation' : 'playcards',
            'cards': playedCardsModel,
            'gameid' : this.gameid,
        });
    }

    CardsPlayed = (cards) => {
        //console.log("CardsPlayed", cards);
        emitter.emit("CardsPlayed", cards);
    }

    SendPlayerAction = (action) =>{
        this.sendMessage({
            'operation' : 'player-action',
            'action': action,   
            'gameid' : this.gameid,         
        });
    }

    ReceivePlayerAction = (action) =>{
        if(action == 'TakeCards')
            emitter.emit("OpponentTookCards");
    }

    //create and join game
    GetExistingGames = () => {
        this.sendMessage({
            'operation' : 'existingGames',           
        });
    }

    ReceiveExistingGames = (gamesTxt) => {
        let games = JSON.parse(gamesTxt);
        //console.log("games", games, games.length);
        if(games.length > 0 )
            this.JoinExistingGame(games[0].id);
        else
            this.CreateNewGame();
    }

    PlayerDisconnected(message){
        emitter.emit("player-disconnected", message);
    }

    ShowError = (message) => {
        console.log("ERROR: ", message);
    }
}