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

// loading textures
loader
    .add("res/AvatarO.png")
    .add("res/AvatarX.png")
    .add("res/Board.png")
    .add("res/smallBoard.png")
    .add("res/Menu.png")
    .add("res/O.png")
    .add("res/X.png")
    .add("res/Token O.png")
    .add("res/Token X.png")
    .load(setup);

function setup() {
    let avatarO = new Sprite(resources["res/AvatarO.png"].texture);
    let avatarX = new Sprite(resources["res/AvatarX.png"].texture);
    let localBoard = new Sprite(resources["res/Board.png"].texture);
    let localBoardPops = [];
    for(i=0;i<9;i++) { localBoardPops.push(new Sprite(resources["res/O.png"].texture)); }
    let backgroundBoardSprites = [];
    for(i=0;i<9;i++) { backgroundBoardSprites.push(new Sprite(resources["res/smallBoard.png"].texture)); }
    let globalBoardPops = [[], [], [], [], [], [], [], [], []];
    for(i=0;i<9;i++) { for(j=0;j<9;j++) { globalBoardPops[i].push(new Sprite(resources["res/O.png"].texture)); } }
    let menu = new Sprite(resources["res/Menu.png"].texture);
    let tokenO = new Sprite(resources["res/Token O.png"].texture);
    let tokenX = new Sprite(resources["res/Token X.png"].texture);

    let avatarWidth = width * 0.18;
    let avatarHeight = height * 0.096;
    let avatarOX = width * 0.77;
    let avatarXX = width * 0.05;
    let avatarY = height * 0.02;

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
}