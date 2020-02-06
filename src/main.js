let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
} 

// prints console message
PIXI.utils.sayHello(type);

// make an application (dimensions are changed later)
let app = new PIXI.Application();

// add canvas to document
document.getElementById('gameBoard').appendChild(app.view);

app.renderer.autoDensity = true;
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
let width = window.innerWidth;
let height = window.innerHeight;
app.renderer.resize(width, height);
app.renderer.view.style.margin = 'auto';

// changing background color
app.renderer.backgroundColor = 0xF1F3F6;

// making shortcut variables
let loader = PIXI.loader;
let resources = loader.resources;
let Sprite = PIXI.Sprite;

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

let victory = false;

// Tokens (E = Empty, C = Cats)
let X = 'X';
let O = 'O';
let E = 'E';
let C = 'C';

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
    .load(setup);

// ============= UI RENDERING/INIT ============= // ----------------------------------------------------------------------------

function setup() {
    avatarO = new Sprite(resources["res/AvatarO.svg"].texture);
    avatarX = new Sprite(resources["res/AvatarX.svg"].texture);
    localBoard = new Sprite(resources["res/BoardGray.svg"].texture);
    localBoardPops = [];
    for(let i=0;i<9;i++) { localBoardPops.push(new Sprite(resources["res/O.svg"].texture)); }
    backgroundBoardSprites = [];
    for(let i=0;i<9;i++) { backgroundBoardSprites.push(new Sprite(resources["res/smallBoard.svg"].texture)); }
    globalBoardVictorySprites = [];
    for(let i=0;i<9;i++) { globalBoardVictorySprites.push(new Sprite(resources["res/VictoryO.svg"].texture)); }
    globalBoardPops = [[], [], [], [], [], [], [], [], []];
    for(let i=0;i<9;i++) { for(let j=0;j<9;j++) { globalBoardPops[i].push(new Sprite(resources["res/smallO.svg"].texture)); } }
    menu = new Sprite(resources["res/Menu.svg"].texture);
    tokenO = new Sprite(resources["res/Token O.svg"].texture);
    tokenX = new Sprite(resources["res/Token X.svg"].texture);
    
    addSprites();
    resize();
    window.addEventListener('resize', resize);

    // INIT

    for(i=0;i<9;i++) {
        localBoardPops[i].square = i;
        localBoardPops[i].renderable = false;
        localBoardPops[i].interactive = true;
        localBoardPops[i].buttonMode = true;
        localBoardPops[i].on('pointerdown', localTapped);
    }

    for(i=0;i<9;i++) for(j=0;j<9;j++) {
        globalBoardPops[i][j].board = i;
        globalBoardPops[i][j].square = j;
        globalBoardPops[i][j].renderable = false;
        globalBoardPops[i][j].interactive = true;
        globalBoardPops[i][j].buttonMode = true;
        globalBoardPops[i][j].on('pointerdown', globalTapped);
    }
}

function addSprites() {
    app.stage.addChild(avatarO);
    app.stage.addChild(avatarX);
    app.stage.addChild(localBoard);
    for(i=0;i<9;i++) {
        app.stage.addChild(localBoardPops[i]);
        app.stage.addChild(backgroundBoardSprites[i]);
        for(j=0;j<9;j++) app.stage.addChild(globalBoardPops[i][j]);
        app.stage.addChild(globalBoardVictorySprites[i]);
    }
    app.stage.addChild(menu);
    app.stage.addChild(tokenO);
    app.stage.addChild(tokenX);
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    app.renderer.resize(width, height);

    const avatarWidth = width * 0.18;
    const avatarHeight = height * 0.096;
    const avatarOX = width * 0.77;
    const avatarXX = width * 0.05;
    const avatarY = height * 0.02;

    avatarO.width = avatarWidth;
    avatarO.height = avatarHeight;
    avatarO.x = avatarOX;
    avatarO.y = avatarY;

    avatarX.width = avatarWidth;
    avatarX.height = avatarHeight;
    avatarX.x = avatarXX;
    avatarX.y = avatarY;

    let localBoardWidth = width * 0.835;
    let localBoardHeight = height * 0.385;
    let localBoardX = width * 0.08;
    let localBoardY = height * 0.58;

    localBoard.width = localBoardWidth;
    localBoard.height = localBoardHeight;
    localBoard.x = localBoardX;
    localBoard.y = localBoardY;

    let localBoardXInc = localBoardX;
    let localBoardYInc = localBoardY;
    for(i=0; i < 9; i++) {
        localBoardPops[i].width = localBoardWidth / 3;
        localBoardPops[i].height = localBoardHeight / 3;
        if(i != 0 && i % 3 == 0) {
            localBoardYInc += localBoardHeight/3;
            localBoardXInc = localBoardX;
        }
        localBoardPops[i].x = localBoardXInc;
        localBoardPops[i].y = localBoardYInc;
        
        localBoardXInc += localBoardWidth/3;
    }

    let boardWidth = width * 0.253;
    let boardHeight = height * 0.117;
    let boardWidthBetween = width * 0.291;
    let boardHeightBetween = height * 0.134;
    let boardX = width * 0.083;
    let boardY = height * 0.174;

    let boardXInc = boardX;
    for(i=0; i < 9; i++) {
        backgroundBoardSprites[i].width = boardWidth;
        backgroundBoardSprites[i].height = boardHeight;
        if(i != 0 && i % 3 == 0) {
            boardY += boardHeightBetween;
            boardXInc = boardX;
        }
        backgroundBoardSprites[i].x = boardXInc;
        backgroundBoardSprites[i].y = boardY;
        boardXInc += boardWidthBetween;
    }

    let yOffset = 0;
    let xOffset = 0;
    for(i=0;i<9;i++) {
        for(j=0;j<9;j++) {
            globalBoardPops[i][j].width = boardWidth/3;
            globalBoardPops[i][j].height = boardHeight/3;
            if(j != 0 && j % 3 == 0) {
                yOffset += boardHeight/3;
                xOffset = 0;
            }
            globalBoardPops[i][j].x = backgroundBoardSprites[i].x + xOffset;
            globalBoardPops[i][j].y = backgroundBoardSprites[i].y + yOffset;
            xOffset += boardWidth/3;
        }
        xOffset = 0;
        yOffset = 0;
    }
    
    for(let i=0;i<9;i++) {
        globalBoardVictorySprites[i].width = backgroundBoardSprites[i].width;
        globalBoardVictorySprites[i].height = backgroundBoardSprites[i].height;
        globalBoardVictorySprites[i].x = backgroundBoardSprites[i].x;
        globalBoardVictorySprites[i].y = backgroundBoardSprites[i].y;
        if(!victory) globalBoardVictorySprites[i].visible = false;
        else globalBoardVictorySprites[i].visible = true;
    }

    menu.width = 0.074 * width;
    menu.height = 0.03 * height;
    menu.x = 0.464 * width;
    menu.y = 0.083 * height;

    let tokenWidth = width * 0.093;
    let tokenHeight = height * 0.043;
    let tokenOX = width * 0.661;
    let tokenXX = width * 0.243;
    let tokenY = height * 0.076;

    tokenO.width = tokenWidth;
    tokenO.height = tokenHeight;
    tokenO.x = tokenOX;
    tokenO.y = tokenY;

    tokenX.width = tokenWidth;
    tokenX.height = tokenHeight;
    tokenX.x = tokenXX;
    tokenX.y = tokenY;

    if(line) {
        renderVictory(line.board1, line.board2, line.token);
    }
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
        render();
        await sleep(100);
    }

    checkWinStates();
    select(this.square);
    render();

    freeze = false;
}

// When part of the global board is tapped
function globalTapped() {
    if(freeze || victory) return;
    if(!boardData[this.board].isActive()) return;
    select(this.board);
    render();
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
            renderVictory(winState.row[0], winState.row[1], winState.token);
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

// ============ RENDERING FUNCTIONS ============ // ----------------------------------------------------------------------------

// All render functions, will later also include things like 'renderScore' etc.
function render() {
    renderLocalBoard();
    renderGlobalBoard();
}

// Renders the local board and makes parts interactive which should be
function renderLocalBoard() {
    if(victory) {
        for(let i=0;i<9;i++) {
            localBoardPops[i].visible = false;
        }
        return;
    }

    if(currentBoard == -1) {
        localBoard.setTexture(resources["res/BoardGray.svg"].texture);
        for(i=0;i<9;i++) {
            localBoardPops[i].renderable = false;
            localBoardPops[i].interactive = false;
            localBoardPops[i].buttonMode = false;
        }
        return;
    }

    localBoard.setTexture(resources["res/Board.svg"].texture);

    for(i=0;i<9;i++) {
        switch(boardData[currentBoard].getSquare(i).getState()) {
            case X:
                localBoardPops[i].setTexture(resources["res/X.svg"].texture);
                localBoardPops[i].renderable = true;
                localBoardPops[i].interactive = false;
                localBoardPops[i].buttonMode = false;
                break;
            case O:
                localBoardPops[i].setTexture(resources["res/O.svg"].texture);
                localBoardPops[i].renderable = true;
                localBoardPops[i].interactive = false;
                localBoardPops[i].buttonMode = false;
                break;
            default:
                localBoardPops[i].renderable = false;
                localBoardPops[i].interactive = true;
                localBoardPops[i].buttonMode = true;
        }
    }
}

// Renders the global board and makes parts interactive which should be
function renderGlobalBoard() {
    if(victory) {
        for(i=0;i<9;i++) boardData[i].active = false;
    }

    for(i=0;i<9;i++) {
        if(boardData[i].active && boardData[i].state == 'E') {
            backgroundBoardSprites[i].setTexture(resources["res/smallBoard.svg"].texture);
        } else {
            backgroundBoardSprites[i].setTexture(resources["res/smallBoardGray.svg"].texture);
        }

        for(j=0;j<9;j++) {
            switch(boardData[i].getSquare(j).getState()) {
                case X:
                    globalBoardPops[i][j].setTexture(resources["res/smallX.svg"].texture);
                    globalBoardPops[i][j].renderable = true;
                    break;
                case O:
                    globalBoardPops[i][j].setTexture(resources["res/smallO.svg"].texture);
                    globalBoardPops[i][j].renderable = true;
                    break;
                default:
                    globalBoardPops[i][j].renderable = false;
                    globalBoardPops[i][j].interactive = true;
                    globalBoardPops[i][j].buttonMode = true;
            }
        }

        if(boardData.state == C) {
            globalBoardVictorySprites[i].visible = true;
            globalBoardVictorySprites[i].setTexture(resources["res/cats.svg"].texture);
        } else if(boardData[i].state != E) {
            globalBoardVictorySprites[i].visible = true;
            globalBoardVictorySprites[i].setTexture(resources["res/Victory"+boardData[i].state+".svg"].texture);
        }
    }
}

// used to draw a line at the end of a match marking the winning row
function drawLine(x1, y1, x2, y2, color) {
    if(line) line.destroy();
    line = new PIXI.Graphics();
    app.stage.addChild(line);

    x2 -= x1;
    y2 -= y1;
    
    line.position.set(x1, y1);
    line.lineStyle(40, color)
        .moveTo(0, 0)
        .lineTo(x2, y2);
}

// Renders a victory
function renderVictory(board1, board2, token) {
    let xOffset = globalBoardVictorySprites[0].width / 2;
    let yOffset = globalBoardVictorySprites[0].height / 2;

    let x1 = globalBoardVictorySprites[board1].x + xOffset;
    let y1 = globalBoardVictorySprites[board1].y + yOffset;
    let x2 = globalBoardVictorySprites[board2].x + xOffset;
    let y2 = globalBoardVictorySprites[board2].y + yOffset;
    let colorX = 0x007BFE;
    let colorO = 0xFF2D55;

    if(token == X) drawLine(x1, y1, x2, y2, colorX);
    if(token == O) drawLine(x1, y1, x2, y2, colorO);

    line.board1 = board1;
    line.board2 = board2;
    line.token = token;
}