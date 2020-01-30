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
app.renderer.backgroundColor = 0xd3d3d3;

// making shortcut variables
let loader = PIXI.loader;
let resources = loader.resources;
let Sprite = PIXI.Sprite;

// loading textures
loader
    .add("res/AvatarO.png")
    .add("res/AvatarX.png")
    .add("res/Board.png")
    .add("res/Menu.png")
    .add("res/O.png")
    .add("res/X.png")
    .load(setup);

function setup() {
    let avatarO = new Sprite(resources["res/AvatarO.png"].texture);
    let avatarX = new Sprite(resources["res/AvatarX.png"].texture);
    let board = new Sprite(resources["res/Board.png"].texture);
    let menu = new Sprite(resources["res/Menu.png"].texture);
    let o = new Sprite(resources["res/O.png"].texture);
    let x = new Sprite(resources["res/X.png"].texture);
    app.stage.addChild(avatarO);
}