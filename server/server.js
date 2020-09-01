var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({port: 8181});
var uuid = require('node-uuid');
//import VirtualDeck from './VirtualDeck.js'
let VirtualDeck = require('./VirtualDeck.js');

let clients = [];
let currgames = [];

function wsSendToAll(recipientIDs, operation, message) {
    let recipients = clients.filter(x=> {return recipientIDs.includes(x.id )})
  for(var i=0; i<recipients.length; i++) {
    var clientSocket = recipients[i].ws;
    if(clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(JSON.stringify({
        "operation": operation,
        "message": message
      }));
    }
  }
}

let gameid = 1;
var clientIndex = 1;

wss.on('connection', function(ws) {
  var client_uuid = uuid.v4();
  var nickname = "user"+clientIndex;
  clientIndex+=1;
  clients.push({"id": client_uuid, "ws": ws, "nickname": nickname});
  console.log('client [%s] connected', client_uuid);  

  ws.on('message', function(message) {    
    let data = JSON.parse(message);
    console.log(data);
    switch(data.operation){
        case 'newgame': 
            CreateNewGame(ws, client_uuid); 
            //wsSend("notification", client_uuid, nickname, JSON.stringify({gameid}));
            break;
        case 'joingame': JoinGame(ws, client_uuid, data.gameid); break;
        case 'takeCards': TakeCards(ws, client_uuid, data.cardNum, data.gameid);break;
    }
      //wsSend("message", client_uuid, nickname, message);    
  });

  var closeSocket = function(customMessage) {
    for(var i=0; i<clients.length; i++) {
        if(clients[i].id == client_uuid) {
            var disconnect_message;
            if(customMessage) {
                disconnect_message = customMessage;
            } else {
                disconnect_message = nickname + " has disconnected";
            }
            wsSendToAll("notification", disconnect_message);
          clients.splice(i, 1);
        }
    }
  }
  ws.on('close', function() {
      closeSocket();
  });

  process.on('SIGINT', function() {
      console.log("Closing things");
      closeSocket('Server has disconnected');
      process.exit();
  });
});
////
CreateNewGame = (ws, client_uuid) => {
    let game = {
        id: gameid,
        players: [client_uuid]
    }
    currgames.push(game);
    gameid++;
    console.log("game created ", game );
    ws.send(JSON.stringify({
        operation: 'newgame',
        gameid: game.id    
    }));
}

JoinGame = (ws, client_uuid, gameid) => {
    let ok = false;
    let existingGame = currgames.find(g=> g.id == gameid);
    if(existingGame){
        console.log("JoinGame?",client_uuid , existingGame.players[0] )
        if(client_uuid != existingGame.players[0] ){
            existingGame.players.push(client_uuid);
            ok = true;
        }
    }
    if(ok===true){
        let deck = new VirtualDeck();
        existingGame.deck = deck;
        wsSendToAll(existingGame.players, "startGame", "");   
    }
    else 
        ws.send(JSON.stringify({
            operation: 'error',
            message: "Game doesn't exist or you are already joined."    
        }));
}

TakeCards = (ws, client_uuid, cardNum, gameid) =>{
    let playerGame = currgames.find(g=> g.id == gameid);
    let cards = playerGame.deck.TakeCards(cardNum);
    //add cards to client_uuid model
    ws.send(JSON.stringify({
        operation: 'takeCards',
        message: JSON.stringify(cards)
    }));
}
