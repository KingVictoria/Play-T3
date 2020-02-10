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

// Renderer class handles all visual updates + UI
class Renderer {
    constructor() {
        app.renderer.autoDensity = true;
        app.renderer.view.style.position = 'absolute';
        app.renderer.view.style.display = 'block';
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        app.renderer.resize(this.width, this.height);
        app.renderer.view.style.margin = 'auto';
        app.renderer.backgroundColor = 0xF1F3F6;
    }

    render() {
        this.renderLocalBoard();
        this.renderGlobalBoard();
    }

    // renders the local board (big bottom board) onto the screen and makes certain UI elements selectable
    renderLocalBoard() {
        if(data.victory) {
            for(let i=0;i<9;i++) localBoardPops[i].visible = false;
            return;
        }
    
        if(data.currentBoard == -1) {
            localBoard.setTexture(resources["res/BoardGray.svg"].texture);
            for(let i=0;i<9;i++) {
                localBoardPops[i].renderable = false;
                localBoardPops[i].interactive = false;
                localBoardPops[i].buttonMode = false;
            }
            return;
        }
    
        localBoard.setTexture(resources["res/Board.svg"].texture);
    
        for(let i=0;i<9;i++) {
            switch(data.getState(data.currentBoard, i)) {
                case X:
                    localBoardPops[i].setTexture(resources["res/X.svg"].texture);
                    localBoardPops[i].visible = true;
                    localBoardPops[i].renderable = true;
                    localBoardPops[i].interactive = false;
                    localBoardPops[i].buttonMode = false;
                    break;
                case O:
                    localBoardPops[i].setTexture(resources["res/O.svg"].texture);
                    localBoardPops[i].visible = true;
                    localBoardPops[i].renderable = true;
                    localBoardPops[i].interactive = false;
                    localBoardPops[i].buttonMode = false;
                    break;
                default:
                    localBoardPops[i].visible = true;
                    localBoardPops[i].renderable = false;
                    localBoardPops[i].interactive = true;
                    localBoardPops[i].buttonMode = true;
            }
        }
    }

    // renders global board (nine smaller boards) onto the screen and makes certain UI elements selectable
    renderGlobalBoard() {
        for(let i=0;i<9;i++) {
            if(data.isSelectable(i)) {
                backgroundBoardSprites[i].setTexture(resources["res/smallBoard.svg"].texture);
            } else {
                backgroundBoardSprites[i].setTexture(resources["res/smallBoardGray.svg"].texture);
            }
    
            for(let j=0;j<9;j++) {
                switch(data.getState(i, j)) {
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
    
            if(data.getState(i) == C) {
                globalBoardVictorySprites[i].visible = true;
                globalBoardVictorySprites[i].setTexture(resources["res/cats.svg"].texture);
            } else if(data.getState(i) != E) {
                globalBoardVictorySprites[i].visible = true;
                globalBoardVictorySprites[i].setTexture(resources["res/Victory"+data.getState(i)+".svg"].texture);
            }
        }
    }

    // a helper function to generically draw lines between two sets of coordinates
    drawLine(x1, y1, x2, y2, color) {
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

    // if there is a global victory state, this function is called to display that
    renderVictory(board1, board2, token) {
        let xOffset = globalBoardVictorySprites[0].width / 2;
        let yOffset = globalBoardVictorySprites[0].height / 2;
    
        let x1 = globalBoardVictorySprites[board1].x + xOffset;
        let y1 = globalBoardVictorySprites[board1].y + yOffset;
        let x2 = globalBoardVictorySprites[board2].x + xOffset;
        let y2 = globalBoardVictorySprites[board2].y + yOffset;
        let colorX = 0x007BFE;
        let colorO = 0xFF2D55;
    
        if(token == X) this.drawLine(x1, y1, x2, y2, colorX);
        if(token == O) this.drawLine(x1, y1, x2, y2, colorO);
    
        line.board1 = board1;
        line.board2 = board2;
        line.token = token;
    }

    // right at the beginning and whenever the screen is resized this function is called to maintain proportions in the UI
    resize() {

        // ratio constants for the iPhone X
        var iPhoneXConstants = {
            avatarWidth: 0.18,
            avatarHeight: 0.096,
            avatarOX: 0.77,
            avatarXX: 0.05,
            avatarY: 0.02,
            localBoardWidth: 0.835,
            localBoardHeight: 0.385,
            localBoardX: 0.08,
            localBoardY: 0.58,
            boardWidth: 0.253,
            boardHeight: 0.117,
            boardWidthBetween: 0.291,
            boardHeightBetween: 0.134,
            boardX: 0.083,
            boardY: 0.174,
            menuWidth: 0.074,
            menuHeight: 0.03,
            menuX: 0.464,
            menuY: 0.083,
            tokenWidth: 0.093,
            tokenHeight: 0.043,
            tokenOX: 0.661,
            tokenXX: 0.243,
            tokenY: 0.076
        } // iPhoneXConstants

        // set current constants to desired set of phone size ratios
        var currentConstants = iPhoneXConstants;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        app.renderer.resize(this.width, this.height);
    
        const avatarWidth = this.width * currentConstants.avatarWidth;
        const avatarHeight = this.height * currentConstants.avatarHeight;
        const avatarOX = this.width * currentConstants.avatarOX;
        const avatarXX = this.width * currentConstants.avatarXX;
        const avatarY = this.height * currentConstants.avatarY;
    
        avatarO.width = avatarWidth;
        avatarO.height = avatarHeight;
        avatarO.x = avatarOX;
        avatarO.y = avatarY;
    
        avatarX.width = avatarWidth;
        avatarX.height = avatarHeight;
        avatarX.x = avatarXX;
        avatarX.y = avatarY;
    
        let localBoardWidth = this.width * currentConstants.localBoardWidth;
        let localBoardHeight = this.height * currentConstants.localBoardHeight;
        let localBoardX = this.width * currentConstants.localBoardX;
        let localBoardY = this.height * currentConstants.localBoardY;
    
        localBoard.width = localBoardWidth;
        localBoard.height = localBoardHeight;
        localBoard.x = localBoardX;
        localBoard.y = localBoardY;
    
        let localBoardXInc = localBoardX;
        let localBoardYInc = localBoardY;
        for(let i=0; i<9; i++) {
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
    
        let boardWidth = this.width * currentConstants.boardWidth;
        let boardHeight = this.height * currentConstants.boardHeight;
        let boardWidthBetween = this.width * currentConstants.boardWidthBetween;
        let boardHeightBetween = this.height * currentConstants.boardHeightBetween;
        let boardX = this.width * currentConstants.boardX;
        let boardY = this.height * currentConstants.boardY;
    
        let boardXInc = boardX;
        for(let i=0; i < 9; i++) {
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
        for(let i=0;i<9;i++) {
            for(let j=0;j<9;j++) {
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
            if(!data.victory) globalBoardVictorySprites[i].visible = false;
        }
    
        menu.width = this.width * currentConstants.menuWidth;
        menu.height = this.height * currentConstants.menuHeight;
        menu.x = this.width * currentConstants.menuX;
        menu.y = this.height * currentConstants.menuY;
    
        let tokenWidth = this.width * currentConstants.tokenWidth;
        let tokenHeight = this.height * currentConstants.tokenHeight;
        let tokenOX = this.width * currentConstants.tokenOX;
        let tokenXX = this.width * currentConstants.tokenXX;
        let tokenY = this.height * currentConstants.tokenY;
    
        tokenO.width = tokenWidth;
        tokenO.height = tokenHeight;
        tokenO.x = tokenOX;
        tokenO.y = tokenY;
    
        tokenX.width = tokenWidth;
        tokenX.height = tokenHeight;
        tokenX.x = tokenXX;
        tokenX.y = tokenY;
    
        if(line) {
            renderer.renderVictory(line.board1, line.board2, line.token);
        }
    }

    // makes all of the sprites
    makeSprites() {
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
    }

    // adds all of the sprites to the stage
    addSprites() {
        app.stage.addChild(avatarO);
        app.stage.addChild(avatarX);
        app.stage.addChild(localBoard);
        for(let i=0;i<9;i++) {
            app.stage.addChild(localBoardPops[i]);
            app.stage.addChild(backgroundBoardSprites[i]);
            for(let j=0;j<9;j++) app.stage.addChild(globalBoardPops[i][j]);
            app.stage.addChild(globalBoardVictorySprites[i]);
        }
        app.stage.addChild(menu);
        app.stage.addChild(tokenO);
        app.stage.addChild(tokenX);
    }

    /* Sets all of the "pops" (token sprites) up on the local and global boards and attaches tap functions (will require
     * refactoring when different control schemes are added)
     */
    setupPops() {
        for(let i=0;i<9;i++) {
            localBoardPops[i].square = i;
            localBoardPops[i].renderable = false;
            localBoardPops[i].interactive = true;
            localBoardPops[i].buttonMode = true;
            localBoardPops[i].on('pointerdown', localTapped);

            for(let j=0;j<9;j++) {
                globalBoardPops[i][j].board = i;
                globalBoardPops[i][j].square = j;
                globalBoardPops[i][j].renderable = false;
                globalBoardPops[i][j].interactive = true;
                globalBoardPops[i][j].buttonMode = true;
                globalBoardPops[i][j].on('pointerdown', globalTapped);
            }
        }
    }

    // Sets up the game board UI
    setup() {
        this.makeSprites();
        this.addSprites();
        this.setupPops();
        this.resize();
        window.addEventListener('resize', this.resize);
    }
}