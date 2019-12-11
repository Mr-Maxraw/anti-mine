/**
 * events:
 * gameWon
 * gameLost
 * tileClicked
 * tileStateUpdated
 * tilesRendered
 * reset
 * 
 */
/**
 * 
 * SUBSCRIBES TO: gameWon, gameLost, reset
 * 
 * BROADCASTS: reset
 * 
 */

 /**
  * Determines game settings based off of level/world object
  * 
  * 
  */
export default class GameManager extends EventTarget{

    constructor(modalContainer, settings, broadcaster){
        super();
        this.settings = settings;
        this.modalContainer = modalContainer;
        this.broadcaster = broadcaster;
        //this.addEventListener('tileClick', (e) => console.log(e.detail), false);
        this.addEventListener('gameWon', (e) => this.playAgainPopup("Congrats, you safely located all the mines!"), false);
        this.addEventListener('gameLost', (e) => this.playAgainPopup("Oh no, you were annihilated!"), false);

        this.addEventListener('reset', (e) => {
            this.modalContainer.removeChild(this.modal);
        }, false);

    }
    createNewGame(){
        this.settings.mines =  Math.floor((Math.random() * 18) + 3);
        this.settings.seed =  Math.floor(Math.random() * 20);
        this.broadcaster.dispatchEvent(new CustomEvent('reset', {detail: {settings: this.settings}}));
    }
    playAgainPopup(message){
        this.modal = document.createElement("div");
        let resetButton = document.createElement("button");
        let messageContainer = document.createElement("div");

        this.modal.id = "game-over-modal"
        this.modal.appendChild(messageContainer);
        this.modal.appendChild(resetButton);

        resetButton.onclick = (e) => this.createNewGame();
        resetButton.innerHTML = "Play Again";

        messageContainer.innerHTML = message;

        this.modalContainer.appendChild(this.modal);


    }

}