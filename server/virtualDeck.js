module.exports = class VirtualDeck {

    constructor(){       
        this.deck = [];
        this.orderedDeck = [];
        this.nextID = 0;
        this.BuildDeck();
        this.shuffle();
        //this.deck = [...this.orderedDeck.sort( (a, b) => {return a.number - b.number} ) ];
    }

    BuildDeck(){
        this.AddSymbolCards("cardSymbol1");
        this.AddSymbolCards("cardSymbol2");
        this.AddSymbolCards("cardSymbol3");
        this.AddSymbolCards("cardSymbol4");
    }

    shuffle(){
        let deckLenght =this.orderedDeck.length;
        this.deck.length = deckLenght;
        for(let i=0; i < deckLenght; i++){
            let random = Math.floor(Math.random()*(deckLenght-i-1));
            this.deck[i] = this.orderedDeck[random];
            this.orderedDeck.splice(random, 1);
        }        
    }
    
    TakeCards(quantity){
        let cards = this.deck.splice(0, quantity);
        // this.ShowCardsInConsole("cards", cards);
        // this.ShowCardsInConsole("deck", this.deck);
        return cards;
    }

    //Build by Card Type
    AddSymbolCards( imageKey ){
        for(let i=1; i<= 10; i++){
            let card = {
                number: i, 
                imageKey:imageKey,                
                ID: this.GetNextID()
            };
            this.orderedDeck.push(card);
        }       
    }
    
    //other 
    ShowCardsInConsole(text, cards){
        console.log(text, cards.map(c=> c.number));
    }

    GetNextID(){
        this.nextID++;
        return this.nextID;
    }
}

// exports.greeting = function(){
//     console.log("Hey, how are you!");
// }