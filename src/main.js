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

// making canvas resizable, changing display/position,
// and resizing to window size
app.renderer.autoDensity = true;
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';

width = window.innerWidth;
height = window.innerHeight;

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
for(let i=0;i<9;i++) {
    boardData.push(new BoardData());
}
let currentBoard = -1;

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

    const avatarWidth = width * 0.18;
    const avatarHeight = height * 0.096;
    const avatarOX = width * 0.77;
    const avatarXX = width * 0.05;
    const avatarY = height * 0.02;

    avatarO.width = avatarWidth;
    avatarO.height = avatarHeight;
    avatarO.x = avatarOX;
    avatarO.y = avatarY;
    app.stage.addChild(avatarO);

    avatarX.width = avatarWidth;
    avatarX.height = avatarHeight;
    avatarX.x = avatarXX;
    avatarX.y = avatarY;
    app.stage.addChild(avatarX);

    let localBoardWidth = width * 0.835;
    let localBoardHeight = height * 0.385;
    let localBoardX = width * 0.08;
    let localBoardY = height * 0.58;

    localBoard.width = localBoardWidth;
    localBoard.height = localBoardHeight;
    localBoard.x = localBoardX;
    localBoard.y = localBoardY;
    app.stage.addChild(localBoard);

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
        
        app.stage.addChild(localBoardPops[i]);
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

        app.stage.addChild(backgroundBoardSprites[i]);
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
            app.stage.addChild(globalBoardPops[i][j]);
        }
        xOffset = 0;
        yOffset = 0;
    }
    
    for(let i=0;i<9;i++) {
        globalBoardVictorySprites[i].width = backgroundBoardSprites[i].width;
        globalBoardVictorySprites[i].height = backgroundBoardSprites[i].height;
        globalBoardVictorySprites[i].x = backgroundBoardSprites[i].x;
        globalBoardVictorySprites[i].y = backgroundBoardSprites[i].y;
        globalBoardVictorySprites[i].visible = false;

        app.stage.addChild(globalBoardVictorySprites[i]);
    }

    menu.width = 0.074 * width;
    menu.height = 0.03 * height;
    menu.x = 0.464 * width;
    menu.y = 0.083 * height;
    app.stage.addChild(menu);

    let tokenWidth = width * 0.093;
    let tokenHeight = height * 0.043;
    let tokenOX = width * 0.661;
    let tokenXX = width * 0.243;
    let tokenY = height * 0.076;

    tokenO.width = tokenWidth;
    tokenO.height = tokenHeight;
    tokenO.x = tokenOX;
    tokenO.y = tokenY;
    app.stage.addChild(tokenO);

    tokenX.width = tokenWidth;
    tokenX.height = tokenHeight;
    tokenX.x = tokenXX;
    tokenX.y = tokenY;
    app.stage.addChild(tokenX);

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let freeze = false;

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

function drawLine(x1, y1, x2, y2, color) {
    let line = new PIXI.Graphics();
    app.stage.addChild(line);

    x2 -= x1;
    y2 -= y1;
    
    line.position.set(x1, y1);
    line.lineStyle(40, color)
        .moveTo(0, 0)
        .lineTo(x2, y2);
}

// Checks to see if there are any win states and modifies data accordingly
function checkWinStates() {
    const xtop = /XXX....../; // x top row
    const xmid = /...XXX.../; // x middle row
    const xbot = /......XXX/; // x bottom row
    const xldg = /X...X...X/; // x left to right diagonal
    const xrdg = /..X.X.X../; // x right to left diagonal
    const xlco = /X..X..X../; // x left column
    const xmco = /.X..X..X./; // x middle column
    const xrco = /..X..X..X/; // x right column

    const otop = /OOO....../; // o top row
    const omid = /...OOO.../; // o middle row
    const obot = /......OOO/; // o bottom row
    const oldg = /O...O...O/; // o left to right diagonal
    const ordg = /..O.O.O../; // o right to left diagonal
    const olco = /O..O..O../; // o left column
    const omco = /.O..O..O./; // o middle column
    const orco = /..O..O..O/; // o right column

    const empt = /E/; // there is an empty square

    state = '';
    for(let i=0;i<9;i++) state += boardData[currentBoard].getSquare(i).state;

    switch(true) {
        case xtop.test(state):
        case xmid.test(state):
        case xbot.test(state):
        case xldg.test(state):
        case xrdg.test(state):
        case xlco.test(state):
        case xmco.test(state):
        case xrco.test(state):
            boardData[currentBoard].state = X;
            globalBoardVictorySprites[currentBoard].visible = true;
            globalBoardVictorySprites[currentBoard].setTexture(resources["res/VictoryX.svg"].texture);
            break;
        case otop.test(state):
        case omid.test(state):
        case obot.test(state):
        case oldg.test(state):
        case ordg.test(state):
        case olco.test(state):
        case omco.test(state):
        case orco.test(state):
            boardData[currentBoard].state = O;
            globalBoardVictorySprites[currentBoard].visible = true;
            globalBoardVictorySprites[currentBoard].setTexture(resources["res/VictoryO.svg"].texture);
            break;
        case empt.test(state):
            // NO WIN CONDITION, BOARD STILL PLAYABLE
            break;
        default:
            boardData[currentBoard].state = C;
            globalBoardVictorySprites[currentBoard].visible = true;
            globalBoardVictorySprites[currentBoard].setTexture(resources["res/cats.svg"].texture);
    }

    
    state = '';
    for(let i=0;i<9;i++) state += boardData[i].state;
    let xOffset = globalBoardVictorySprites[0].width / 2;
    let yOffset = globalBoardVictorySprites[0].height / 2;
    let x1, x2, y1, y2;

    switch(true) {
        case xtop.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[2].x + xOffset;
            y2 = globalBoardVictorySprites[2].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xmid.test(state):
            x1 = globalBoardVictorySprites[3].x + xOffset;
            y1 = globalBoardVictorySprites[3].y + yOffset;
            x2 = globalBoardVictorySprites[5].x + xOffset;
            y2 = globalBoardVictorySprites[5].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xbot.test(state):
            x1 = globalBoardVictorySprites[6].x + xOffset;
            y1 = globalBoardVictorySprites[6].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xldg.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xrdg.test(state):
            x1 = globalBoardVictorySprites[2].x + xOffset;
            y1 = globalBoardVictorySprites[2].y + yOffset;
            x2 = globalBoardVictorySprites[6].x + xOffset;
            y2 = globalBoardVictorySprites[6].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xlco.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[6].x + xOffset;
            y2 = globalBoardVictorySprites[6].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xmco.test(state):
            x1 = globalBoardVictorySprites[1].x + xOffset;
            y1 = globalBoardVictorySprites[1].y + yOffset;
            x2 = globalBoardVictorySprites[7].x + xOffset;
            y2 = globalBoardVictorySprites[7].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case xrco.test(state):
            x1 = globalBoardVictorySprites[2].x + xOffset;
            y1 = globalBoardVictorySprites[2].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0x007BFE);
            victory = true;
            break;
        case otop.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[2].x + xOffset;
            y2 = globalBoardVictorySprites[2].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case omid.test(state):
            x1 = globalBoardVictorySprites[3].x + xOffset;
            y1 = globalBoardVictorySprites[3].y + yOffset;
            x2 = globalBoardVictorySprites[5].x + xOffset;
            y2 = globalBoardVictorySprites[5].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case obot.test(state):
            x1 = globalBoardVictorySprites[6].x + xOffset;
            y1 = globalBoardVictorySprites[6].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case oldg.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case ordg.test(state):
            x1 = globalBoardVictorySprites[2].x + xOffset;
            y1 = globalBoardVictorySprites[2].y + yOffset;
            x2 = globalBoardVictorySprites[6].x + xOffset;
            y2 = globalBoardVictorySprites[6].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case olco.test(state):
            x1 = globalBoardVictorySprites[0].x + xOffset;
            y1 = globalBoardVictorySprites[0].y + yOffset;
            x2 = globalBoardVictorySprites[6].x + xOffset;
            y2 = globalBoardVictorySprites[6].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case omco.test(state):
            x1 = globalBoardVictorySprites[1].x + xOffset;
            y1 = globalBoardVictorySprites[1].y + yOffset;
            x2 = globalBoardVictorySprites[7].x + xOffset;
            y2 = globalBoardVictorySprites[7].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case orco.test(state):
            x1 = globalBoardVictorySprites[2].x + xOffset;
            y1 = globalBoardVictorySprites[2].y + yOffset;
            x2 = globalBoardVictorySprites[8].x + xOffset;
            y2 = globalBoardVictorySprites[8].y + yOffset;
            drawLine(x1, y1, x2, y2, 0xFF2D55);
            victory = true;
            break;
        case empt.test(state):
            // NO WIN CONDITION, PLAY CONTINUES
            break;
        default:
            let x = 0;
            let o = 0;
            for(let i=0;i<9;i++) {
                if(boardData[i].state == X) x++;
                if(boardData[i].state == O) o++;
            }

            if(o > x) {
                // O VICTORY
            } else if(x > o) {
                // X VICTORY
            } else {
                // CATS GAME
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
    }
}