let gradient = [
    {
        weight: 0,
        r: 255,
        g: 255,
        b: 255,
    },
    {
        weight: 15,
        r: 57,
        g: 255,
        b: 150,
    },
    {
        weight: 85,
        r: 26,
        g: 150,
        b: 255,
    },
    {
        weight: 100,
        r: 0,
        g: 0,
        b: 0,
    }


];

let gradientPointValue = (gradient, weight) => {
    let i;
    //find colors surounding weight
    for(i = 0; i < gradient.length; i++){
        if(gradient[i].weight > weight) break;
    }
    let c1 = gradient[i];
    let c0 = gradient[i - 1];

    let npw = weight - c0.w; // normalize point weight
    let ncw = c1.w - c0.w // normalize color weight

    // normalize weight, multiply by slope, add to first color
    let r = Math.round(c0.r + npw * (c1.r - c0.r) / ncw); 
    let g = Math.round(c0.g + npw * (c1.g - c0.g) / ncw); 
    let b = Math.round(c0.b + npw * (c1.b - c0.b) / ncw); 

    return `rgb(${r}, ${g}, ${b})`;
}




export default class BoardRender{
    //initiate board elements, handle animations, handle click events
    constructor(container, board, onWin, onLose){
        this.container = container;
        this.onWin = onWin;
        this.onLose = onLose;
        this.reset(board);
        this.build();
        
    }
    reset(board){
        this.boardData = board;
        this.elements = [];
        this.color = Math.floor(Math.random() * 3);
    }
    destroy(){
        while(this.container.firstChild){
            this.container.removeChild(this.container.firstChild); 
        }
    }
    build(){

        //build board
        for(let i = 0; i < this.boardData.columns; i++){

            this.elements[i] = [];

            //should a reference to row be saved?
            let row = this.container.appendChild(document.createElement("div"));
            row.id = `row-${i}`;
            row.className = `game-row`;

            for(let j = 0; j < this.boardData.rows; j++){

                this.elements[i][j] = row.appendChild(document.createElement("div"));
                let targetElement = this.elements[i][j];

                let cellObj = this.boardData.field[i][j];

                //apply tags
                targetElement.id = cellObj.id; //unused... maybe use for animation?
                targetElement.className = 'cell unselectable';
                targetElement.oncontextmenu = () => {return false};
                targetElement.x = j;
                targetElement.y = i;

                this.updateTileAppearence(i,j);
                
            }
        }
    }
    updateTileAppearence(x, y){

        let targetData = this.boardData.field[x][y];
        let targetElement = this.elements[x][y];

        if(!targetData.uncovered){ //if covered
            //render covered tyle
            targetElement.classList.add('cell-covered');
            targetElement.classList.remove('cell-revealed'); //not needed unless tiles can be re-covered
            targetElement.onclick = (e) => {
                //console.log('' + e.target.x + ', ' + e.target.y);
                this.boardData.uncoverTile(x, y);

                //rerender all... could also rerender only tiles that are updated
                this.updateAllAppearance();

                if(this.boardData.gameLost){
                    this.onLose();
                    return;
                }
                if(this.boardData.gameWon){
                    this.onWin();
                    return;
                }

            };
            return;
        }
        
        //***render uncovered tile***

        //update classes
        targetElement.classList.remove('cell-covered');
        targetElement.classList.add('cell-revealed');

        //update click functionality
        targetElement.onclick = null;

        //append number container if one does not exist
        if(targetElement.childNodes.length == 0 && false){
            let cellChild = targetElement.appendChild(document.createElement("div"));
            cellChild.className = `cell-value`;
            cellChild.innerHTML = targetData.value;
            //apply mine classes to tiles that are mines
            if(targetData.isMine){
                targetElement.classList.add('cell-mine');
                cellChild.classList.add('cell-value-mine');
            }
        }



        //map value => color value
        //assumes .value is in the range [-1,1]
        //colorval mapping is slapdashed as fuck but need MVP
        let normalize_midpoint = 0.6;
        let normalize_weight = 1.3;

        //manually cap color val at 0 and 255
        let colorVal =  Math.max(0, Math.min((targetData.value/normalize_weight + normalize_midpoint) * 255, 255));
        switch(this.color){
            case 0:
                targetElement.style.background = `rgb(${Math.floor(colorVal / 1)},${Math.floor(colorVal / 2)},${Math.floor(colorVal / 1.2)})`;
                break;
            case 1:
                targetElement.style.background = `rgb(${Math.floor(colorVal / 1.2)},${Math.floor(colorVal / 1)},${Math.floor(colorVal / 2)})`;
                break;
            default:
                targetElement.style.background = `rgb(${Math.floor(colorVal / 2)},${Math.floor(colorVal / 1.2)},${Math.floor(colorVal / 1)})`;
        }
        

        //color mines
        if(targetData.isMine){
            if(targetData.value === -1){
                targetElement.style.background = '#000000';
            }else{
                targetElement.style.background = '#ffffff';
            }
            
        }


    }
    updateAllAppearance(){
        for(let i = 0; i < this.boardData.columns; i++){
            for(let j = 0; j < this.boardData.rows; j++){
                this.updateTileAppearence(i,j);
                let target = this.boardData.field[i][j];
                target.checked = false;
                //check to reveal mines that are "solved" ... currently only works for mines that are not touching other mines... need flood fill for general solution
                if(target.isMine){

                    //check to see if all neighbors are uncovered, recurse over neighbors that are mines and unchecked...this entire function belongs in board.js



                    //check that all neighbors are revealed (uncovered)
                    if(this.validCoordinate(i, j + 1) && !this.boardData.field[i][j + 1].uncovered) continue;
                    if(this.validCoordinate(i, j - 1) && !this.boardData.field[i][j - 1].uncovered) continue;
                    if(this.validCoordinate(i + 1, j) && !this.boardData.field[i + 1][j].uncovered) continue;
                    if(this.validCoordinate(i - 1, j) && !this.boardData.field[i - 1][j].uncovered) continue;

                    if(this.validCoordinate(i + 1, j + 1) && !this.boardData.field[i + 1][j + 1].uncovered) continue;
                    if(this.validCoordinate(i - 1, j - 1) && !this.boardData.field[i - 1][j - 1].uncovered) continue;
                    if(this.validCoordinate(i + 1, j - 1) && !this.boardData.field[i + 1][j - 1].uncovered) continue;
                    if(this.validCoordinate(i - 1, j + 1) && !this.boardData.field[i - 1][j + 1].uncovered) continue;


                    
                    console.log('boop')
                    target.uncovered = true;
                    this.updateTileAppearence(i,j);
                }
            }
        }
    }

    validCoordinate(x,y){
        return this.boardData.field[x] && this.boardData.field[x][y];
    }
    //https://fontawesome.com/icons/atom?style=solid
    //https://fontawesome.com/icons/bomb?style=solid
    //https://fontawesome.com/icons/bullseye?style=solid
    //https://fontawesome.com/icons/carrot?style=solid
    //https://fontawesome.com/icons/centos?style=brands
    //
}