// Preloading
let app = new PIXI.Application();
document.getElementById('gameBoard').appendChild(app.view);

// Load in renderer
renderer = new Renderer();

// making shortcut variables
let loader = PIXI.loader;
let resources = loader.resources;
let Sprite = PIXI.Sprite;

// sprite variables
let avatarO;
let avatarX;
let localBoard;
let localBoardPops;
let backgroundBoardSprites;
let globalBoardPops;
let menu;
let tokenO;
let tokenX;
let globalBoardVictorySprites;
let line;

// helper variables
let victory = false;

// Tokens (E = Empty, C = Cats)
let X = 'X';
let O = 'O';
let E = 'E';
let C = 'C';

// Data for the game board
class BoardData {
    constructor() {
        this.active = true;
        this.state = E;
        this.squares = [];
        for(let j=0;j<9;j++) this.squares.push(new SquareData());
    }

    isActive() {
        return this.active;
    }

    getSquare(id) {
        return this.squares[id];
    }

    markSquare(id, state) {
        this.getSquare(id).setState(state);
    }
}

// Data for each square
class SquareData {
    constructor() {
        this.state = E;
    }

    isMarked() {
        return this.state != E;
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }
}

let boardData = [];
for(let i=0;i<9;i++) boardData.push(new BoardData());
let currentBoard = -1;

// Win States (used to check the current board and the global board for victories)
winStates = [];

// X Win States
winStates.push({state:/XXX....../, token:X, row:[0, 2]}); // x top row
winStates.push({state:/...XXX.../, token:X, row:[3, 5]}); // x middle row
winStates.push({state:/......XXX/, token:X, row:[6, 8]}); // x bottom row
winStates.push({state:/X...X...X/, token:X, row:[0, 8]}); // x left to right diagonal
winStates.push({state:/..X.X.X../, token:X, row:[2, 6]}); // x right to left diagonal
winStates.push({state:/X..X..X../, token:X, row:[0, 6]}); // x left column
winStates.push({state:/.X..X..X./, token:X, row:[1, 7]}); // x middle column
winStates.push({state:/..X..X..X/, token:X, row:[2, 8]}); // x right column

// O Win States
winStates.push({state:/OOO....../, token:O, row:[0, 2]}); // o top row
winStates.push({state:/...OOO.../, token:O, row:[3, 5]}); // o middle row
winStates.push({state:/......OOO/, token:O, row:[6, 8]}); // o bottom row
winStates.push({state:/O...O...O/, token:O, row:[0, 8]}); // o left to right diagonal
winStates.push({state:/..O.O.O../, token:O, row:[2, 6]}); // o right to left diagonal
winStates.push({state:/O..O..O../, token:O, row:[0, 6]}); // o left column
winStates.push({state:/.O..O..O./, token:O, row:[1, 7]}); // o middle column
winStates.push({state:/..O..O..O/, token:O, row:[2, 8]}); // o right column

const empt = /E/; // there is an empty square

// loading textures
loader
    .add("res/AvatarO.svg")
    .add("res/AvatarX.svg")
    .add("res/Board.svg")
    .add("res/BoardGray.svg")
    .add("res/smallBoard.svg")
    .add("res/smallBoardGray.svg")
    .add("res/VictoryO.svg")
    .add("res/VictoryX.svg")
    .add("res/Menu.svg")
    .add("res/O.svg")
    .add("res/smallO.svg")
    .add("res/X.svg")
    .add("res/smallX.svg")
    .add("res/cats.svg")
    .add("res/Token O.svg")
    .add("res/Token X.svg")
    .load(init);

function init() {
    renderer.setup();
}

// ========== CONTROLS AND GAME LOGIC ========== // ----------------------------------------------------------------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let freeze = false; // used to freeze the controls

// When part of the local board is tapped
let player = true;
async function localTapped() {
    if(freeze || victory) return;
    if(currentBoard == -1) return;
    if(boardData[currentBoard].getSquare(this.square).isMarked()) return;

    freeze = true;

    if(player) {
        boardData[currentBoard].markSquare(this.square, O);
        player = false;
    } else {
        boardData[currentBoard].markSquare(this.square, X);
        player = true;
    }

    // Waits 100ms to give players a response to tapping in the square
    if(currentBoard != this.square || boardData[this.square].state != E) {
        renderer.render();
        await sleep(100);
    }

    checkWinStates();
    select(this.square);
    renderer.render();

    freeze = false;
}

// When part of the global board is tapped
function globalTapped() {
    if(freeze || victory) return;
    if(!boardData[this.board].isActive()) return;
    select(this.board);
    renderer.render();
}

// Checks to see if there are any win states and modifies data accordingly
function checkWinStates() {
    // in current board
    state = '';
    for(let i=0;i<9;i++) state += boardData[currentBoard].getSquare(i).state;
    winStates.forEach(winState => { if(winState.state.test(state)) boardData[currentBoard].state = winState.token; });
    if(!empt.test(state)) boardData[currentBoard].state = C;

    // in global board    
    state = '';
    for(let i=0;i<9;i++) state += boardData[i].state;
    winStates.forEach(winState => {
        if(winState.state.test(state)) {
            renderer.renderVictory(winState.row[0], winState.row[1], winState.token);
            victory = true;
        }
    });
    if(!empt.test(state)) {
        let x = 0;
        let o = 0;
        for(let i=0;i<9;i++) {
            if(boardData[i].state == X) x++;
            else if(boardData[i].state == O) o++;
        }

        if(o > x) {
            console.log("O VICTORY");
        } else if(x > o) {
            console.log("X VICTORY");
        } else {
            console.log("CATS GAME");
        }
        victory = true;
    }
}

// Makes a board selection automatically if possible, otherwise will allow player to select from global board
function select(board) {
    if(boardData[board].state != E) {
        currentBoard = -1;
    } else {
        currentBoard = board;
    }

    for(let i=0;i<9;i++) {
        if(currentBoard == -1) {
            boardData[i].active = true;
        } else if(currentBoard == i) {
            boardData[i].active = true;
        } else {
            boardData[i].active = false;
        }
    }
}