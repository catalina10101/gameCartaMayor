var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({port: 8181});
var uuid = require('node-uuid');
//import VirtualDeck from './VirtualDeck.js'
let VirtualDeck = require('./VirtualDeck.js');

let clients = [];
let currgames = [];

function wsSendToAll(recipientIDs, operation, message) {
    let recipients = clients.filter(x=> {return recipientIDs.includes(x.id )});
    console.log("wsSendToAll", recipients.length);
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
        case 'playcards': CardsPlayed(ws, client_uuid, data);break;
        case 'existingGames': GetExistingGames(ws, client_uuid, data);break;
        case 'player-action': SendPlayerAction(ws, client_uuid, data); break;
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
                disconnect_message = nickname + " has disconnected.";
            }
            ///
            let playerCurrGame = currgames.find(g=> g.players.includes(client_uuid));
            if(playerCurrGame){      
                SendMSToOtherPlayers(playerCurrGame.id, client_uuid, "player-disconnected", disconnect_message);
                let idx = currgames.map(x=> x.id).indexOf(playerCurrGame.id);
                currgames.splice(idx, 1);                          
                console.log(clients[i].nickname + " has disconnected.", currgames);
            }
            ///
            //wsSendToAll("notification", disconnect_message);
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
    //remove existen game where player joined
    let playerCurrGames = currgames.filter(g=> g.players.includes(client_uuid));
    playerCurrGames.forEach(g=> {
        if(g.players.length <= 1 && g.id != gameid ){
            let idx = currgames.map(x=> x.id).indexOf(g.id);
            currgames.splice(idx, 1);
        }            
    });
    //join existing game
    let existingGame = currgames.find(g=> g.id == gameid);
    let errorMsg = '';
    if(existingGame){
        console.log("JoinGame?",client_uuid , existingGame.players[0] )
        if(client_uuid != existingGame.players[0] ){

            if(existingGame.players.length >= 2){
                errorMsg = 'This game already has 2 players.';
            }
            else {
                existingGame.players.push(client_uuid);
                ok = true;
            }
        }
        else
            errorMsg = 'You already joined this game.';
    }
    else 
        errorMsg = "Game doesn't exist.";
    if(ok===true){       
        let playerTurn = Number(existingGame.players.indexOf(client_uuid)) + 1;
        ws.send(JSON.stringify({
            operation: 'joingame',
            turn: 'player' +  playerTurn
        }));
        let deck = new VirtualDeck();
        existingGame.deck = deck;
        wsSendToAll(existingGame.players, "startGame", "");   
    }
    else 
        ws.send(JSON.stringify({
            operation: 'error',
            message: errorMsg    
        }));
}

TakeCards = (ws, client_uuid, cardNum, gameid) =>{
    console.log("TakeCards",currgames, gameid );
    let playerGame = currgames.find(g=> g.id == Number(gameid));
    let cards = playerGame.deck.TakeCards(cardNum);
    ws.send(JSON.stringify({
        operation: 'takeCards',
        message: JSON.stringify(cards)
    }));
}

CardsPlayed = (ws, client_uuid, data) => {
    //let playerGame = currgames.find(g=> g.players.includes(client_uuid));
    SendMSToOtherPlayers(data.gameid, client_uuid, "cardsplayed", JSON.stringify(data.cards));
}

SendPlayerAction = (ws, client_uuid, data) => {
    SendMSToOtherPlayers(data.gameid, client_uuid, "player-action", data.action);
}

SendMSToOtherPlayers = (gameid, client_uuid, operation, message) => {
    let playerGame = currgames.find(g=> g.id === Number(gameid));    
    let playerIdx = playerGame.players.indexOf(client_uuid);
    let otherPlayers = [...playerGame.players];
    //console.log("game ", playerGame.id, ", playerIdx: ", playerIdx, ", otherPlays", otherPlayers);
    otherPlayers.splice(playerIdx,1);
    wsSendToAll(otherPlayers, operation, message);
}

GetExistingGames = (ws, client_uuid, data) => {
    ws.send(JSON.stringify({
        operation: 'existingGames',
        message: JSON.stringify(currgames)
    }));
}
