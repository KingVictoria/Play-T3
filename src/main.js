// Preloading
let app = new PIXI.Application();
document.getElementById('gameBoard').appendChild(app.view);

// load in renderer
renderer = new Renderer();

// making shortcut variables
let loader = PIXI.loader;
let resources = loader.resources;
let Sprite = PIXI.Sprite;

// board data
let data;

// used to freeze the controls
let freeze = false;

// NOTE: right here should put a "Loading" thing, won't show for more than a second (likely)

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
    data = new BoardData(); // will pass in data for turn-based multiplayer in the future
    renderer.setup();
}

// =========== HELPER =========== // ----------------------------------------------------------------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== CONTROLS ========== // ----------------------------------------------------------------------------

/* These controls are good for any mobile phone, but we'll need to make new ones for Smart TV, consoles, and computers
 * as they will likely not have the local board & might not even support free clicking/tapping. I will likely make a
 * ControlHandler in the future which will genericize controls, but we need to see what we need first.
 */

// When part of the local board (the big square at the bottom) is tapped
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

// When part of the global board (one of the nine squares in the center screen) is tapped
async function globalTapped() {
    if(freeze || data.victory) return;
    if(!data.isSelectable(this.board)) return;
    data.select(this.board);
    renderer.render();
}