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
        console.log(clickId);
        console.log(square_piece);

        // SE O CLICK FOR IDENTIFICADO MAS O SQUARE ID FOR NULL => ESTADO INTERMEDIO 1 => COLOCAR PEÇAS NO BOARD
        // SE O CLICK FOR IDDENTIFICADO E O SQUARE ID TB => ESTADO INTERMEDIO 2 => MOVER PECAS NO BOARD
        // NO ESTADO INTERMEDIO 2 => O CLICKID DA PECA E DO SITIO ONDE ESTA (SQUARE) E O MESMO

        if (!square_piece && this.origin === null) {
            BoardState.setHighlightedSquare(null);
        } else {
            if (square_piece && square_piece.color === "green" && current_player === 1 ||
                square_piece && square_piece.color === "yellow" && current_player === 2) {
                
                this.origin = {row, column};
                BoardState.setHighlightedSquare(this.origin);
            } else if (this.origin !== null) {
                GameState.movePiece(this.origin.row, this.origin.column, row, column);
                this.origin = null;
                BoardState.setHighlightedSquare(null);
            }
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