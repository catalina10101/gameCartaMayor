let ws;
class ServerSocket{

    constructor(){
        this.Initialize();
        this.gameid= null;
    }

    Initialize = () => {
        ws = new WebSocket("ws://localhost:8181");
        var nickname = "";
        ws.onopen = function(e) {
          console.log('Connection to server opened');
        }
        
        ws.onmessage = this.OnMessageHandler;

        ws.onclose = function(e) {              
          console.log("Connection closed");
        }
    }

    OnMessageHandler = (e) =>{
        var data = JSON.parse(e.data);                
        console.log(data);
        switch(data.operation){
          case 'newgame': 
              this.gameid = data.gameid;
              sessionStorage.setItem('gameid', data.gameid);
              //window.location = `http://127.0.0.1:8080/CartaMayor/front/`;
              //wsSend("notification", client_uuid, nickname, JSON.stringify({gameid}));
              break;
          case 'error': this.ShowError(data.message); break;          
          case 'startGame': this.StartGame();break;         
          case 'takeCards': this.ReceiveCards(data.message);break;  
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
    }

    JoinExistingGame = (gameId) => {  
        this.gameid = gameid;
        sessionStorage.setItem('gameid', gameid);      
        this.sendMessage({
            'operation' : 'joingame',
            'gameid' : gameId
        });
    }

    StartGame = () => {
        $('#phaser-game').css("display", "block");//"visibility", "visible"
        $('.join-game-form').closest('.vertical-center').css("display", "none");
    }

    TakeCards = (quantity) => {
        this.sendMessage({
            'operation' : 'takeCards',
            'gameid' : this.gameid,
            'cardNum': quantity
        });
    }

    ReceiveCards = (cardsStr) => {
        let cards = JSON.parse(cardsStr);
        console.log(cards);        
    }

    ShowError = (message) => {
        console.log("ERROR: ", message);
    }
}