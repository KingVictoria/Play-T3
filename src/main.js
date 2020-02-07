// Preloading
let app = new PIXI.Application();
document.getElementById('gameBoard').appendChild(app.view);

// Load in renderer
renderer = new Renderer();

// making shortcut variables
let loader = PIXI.loader;
let resources = loader.resources;
let Sprite = PIXI.Sprite;

let data = new BoardData();

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

// Game initialization (will be used for much more in the future)
function init() {
    renderer.setup();
}

// =========== HELPER =========== // ----------------------------------------------------------------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== CONTROLS ========== // ----------------------------------------------------------------------------

let freeze = false; // used to freeze the controls

// When part of the local board is tapped
async function localTapped() {
    if(freeze || data.victory) return;
    if(data.currentBoard == -1) return;
    if(!data.isSelectable(data.currentBoard, this.square)) return;

    freeze = true;

    data.setState(data.turn, data.currentBoard, this.square);

    // Waits 100ms to give players a response to tapping in the square
    if(data.currentBoard != this.square || data.getState(this.square) != E) {
        renderer.render();
        await sleep(100);
    }

    data.checkWinStates();
    data.next();
    data.select(this.square);
    renderer.render();

    freeze = false;
}

// When part of the global board is tapped
async function globalTapped() {
    if(freeze || data.victory) return;
    if(!data.isSelectable(this.board)) return;
    data.select(this.board);
    renderer.render();
}