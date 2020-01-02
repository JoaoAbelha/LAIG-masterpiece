class ClickHandler {    
    static setScene(scene) {
        this.scene = scene;
    }

    static verifyClicks() {
        if (!this.scene.pickMode) {
            if (this.scene.pickResults !== null && this.scene.pickResults.length > 0) {
                for (let i = 0; i < this.scene.pickResults.length; i++) {
                    const obj = this.scene.pickResults[i][0];
                    if (obj) {
                        const clickId = this.scene.pickResults[i][1];		
                        this.verifyClick(clickId);
                    }
                }
                this.scene.pickResults = [];
            }
        }

        this.scene.clearPickRegistration();
    }

    static verifyClick(clickId) {
        if (clickId >= 0 && clickId < 25) {
            this.boardClickHandler(clickId);
        } else if (clickId > 25 && clickId < 100) {
            this.outPieceClickHandler(clickId);
        } else if (clickId > 500) {
            this.buttonClickHandler(clickId);
        }
    }

    static boardClickHandler(clickId) {
        if (!GameState.isCurrentPlayerHuman() || !GameState.isPlaying()) {
            return;
        }

        const column = clickId % 5;
        const row = Math.floor(clickId / 5);
        const current_player = GameState.getCurrentPlayerColor();
        const square_piece = BoardState.getPieceAt(row, column);

        if (!square_piece && this.origin === null) {
            BoardState.setHighlightedSquare(null);
        } else {
            if (square_piece && square_piece.color === "green" && current_player === 1 ||
                square_piece && square_piece.color === "yellow" && current_player === 2) {
                
                this.origin = {row, column};
                BoardState.setHighlightedSquare(this.origin);
            } else if (this.origin !== null) {
                (this.origin.column < 0 || this.origin.column > 4) ? 
                GameState.insertPiece(this.origin.row, this.origin.column, row, column) :
                GameState.movePiece(this.origin.column, this.origin.row, row, column);
                this.origin = null;
                BoardState.setHighlightedSquare(null);
            }
        }
    }

    static outPieceClickHandler(clickId) {
        if(!GameState.isCurrentPlayerHuman() || !GameState.isPlaying()) {
            return;
        }

        let actualId = clickId - 30;
        const column = (actualId % 7 === 2) ? -2 : actualId % 7;
        const row = Math.floor(actualId / 7);
        const current_player = GameState.getCurrentPlayerColor();
        const square_piece = BoardState.getPieceAt(row, column);
        
        if (!square_piece && this.origin === null) {
            BoardState.setHighlightedSquare(null);
        } else if (square_piece && square_piece.color === "green" && current_player === 1 ||
                   square_piece && square_piece.color === "yellow" && current_player === 2) {
            this.origin = {row, column};
            BoardState.setHighlightedSquare(this.origin);
        }
    }

    static buttonClickHandler(clickId) {
        this.buttonActions[clickId]();
    }

    static registerButton(action) {
        this.numRegisteredButtons++;

        let index = this.baseButtonPickId + this.numRegisteredButtons;
        this.buttonActions[index] = action;

        return index;
    }

    static reset() {
        this.origin = null;
        BoardState.setHighlightedSquare(null);
    }
};

ClickHandler.origin = null;
ClickHandler.buttonActions = [];
ClickHandler.numRegisteredButtons = 0;
ClickHandler.baseButtonPickId = 500;