// Tokens (E = Empty, C = Cats)
let X = 'X';
let O = 'O';
let E = 'E';
let C = 'C';

// BoardData class handles all board data and data-related game logic (e.g. check win states)
class BoardData {
    constructor(boards, states, currentBoard, turn) {
        this.victory = false;
        this.winner = E;

        if(boards===undefined) {
            this.boards = [];
            this.states = [];
            for(let i=0;i<9;i++) {
                this.boards.push([]);
                this.states.push(E);
                for(let j=0;j<9;j++) this.boards[i].push(E);
            }
            this.currentBoard = -1;
            this.turn = X;
        } else{
            this.boards = boards;
            this.states = states;
            this.currentBoard = currentBoard;
            this.turn = turn;
        }

        this.generateWinStates();
    }

    next() {
        if(this.turn == X)  this.turn = O;
        else                this.turn = X;
    }

    getState(board, square) {
        if(square === undefined)    return this.states[board];
        else                        return this.boards[board][square];
    }

    isMarked(board, square) {
        return this.getState(board, square) == X 
            || this.getState(board, square) == O
            || this.getState(board) == C;
    }

    setState(state, board, square) {
        if(square === undefined)    this.states[board] = state;
        else                        this.boards[board][square] = state;
    }

    isSelectable(board, square) {
        if(square == undefined) return !this.isMarked(board) && (board == this.currentBoard || this.currentBoard == -1);
        else                    return !this.isMarked(board, square);
    }

    select(board) {
        if(this.isMarked(board))    this.currentBoard = -1;
        else                        this.currentBoard = board;
    }

    checkWinStates() {
        // in current board
        let state = '';
        for(let i=0;i<9;i++) state += this.getState(data.currentBoard, i);
        this.winStates.forEach(winState => { if(winState.state.test(state)) this.setState(winState.token, data.currentBoard); });
        if(!this.empt.test(state)) this.setState(C, data.currentBoard);
    
        // in global board    
        state = '';
        for(let i=0;i<9;i++) state += this.getState(i);
        this.winStates.forEach(winState => {
            if(winState.state.test(state)) {
                renderer.renderVictory(winState.row[0], winState.row[1], winState.token);
                this.victory = true;
                this.winner = winState.token;
                this.winnerRow = winState.row;
            }
        });
        if(!this.empt.test(state)) {
            let x = 0;
            let o = 0;
            for(let i=0;i<9;i++) {
                if(this.getState(i) == X) x++;
                else if(this.getState(i) == O) o++;
            }
    
            if(o > x)       this.winner = O;
            else if(x > o)  this.winner = X;
            else            this.winner = C;
            console.log("Victory by full board with " + this.winner);
            this.victory = true;
        }
    }

    generateWinStates() {
        // Win States (used to check the current board and the global board for victories)
        this.winStates = [];

        // X Win States
        this.winStates.push({state:/XXX....../, token:X, row:[0, 2]}); // x top row
        this.winStates.push({state:/...XXX.../, token:X, row:[3, 5]}); // x middle row
        this.winStates.push({state:/......XXX/, token:X, row:[6, 8]}); // x bottom row
        this.winStates.push({state:/X...X...X/, token:X, row:[0, 8]}); // x left to right diagonal
        this.winStates.push({state:/..X.X.X../, token:X, row:[2, 6]}); // x right to left diagonal
        this.winStates.push({state:/X..X..X../, token:X, row:[0, 6]}); // x left column
        this.winStates.push({state:/.X..X..X./, token:X, row:[1, 7]}); // x middle column
        this.winStates.push({state:/..X..X..X/, token:X, row:[2, 8]}); // x right column

        // O Win States
        this.winStates.push({state:/OOO....../, token:O, row:[0, 2]}); // o top row
        this.winStates.push({state:/...OOO.../, token:O, row:[3, 5]}); // o middle row
        this.winStates.push({state:/......OOO/, token:O, row:[6, 8]}); // o bottom row
        this.winStates.push({state:/O...O...O/, token:O, row:[0, 8]}); // o left to right diagonal
        this.winStates.push({state:/..O.O.O../, token:O, row:[2, 6]}); // o right to left diagonal
        this.winStates.push({state:/O..O..O../, token:O, row:[0, 6]}); // o left column
        this.winStates.push({state:/.O..O..O./, token:O, row:[1, 7]}); // o middle column
        this.winStates.push({state:/..O..O..O/, token:O, row:[2, 8]}); // o right column

        this.empt = /E/; // there is an empty square
    }
}