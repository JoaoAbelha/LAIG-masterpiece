const BOARD_SIZE = 4;
const BOARD_MARGIN = BOARD_SIZE / 32;
const SQUARE_SIZE = (BOARD_SIZE - 2 * BOARD_MARGIN) / 10;

class BoardState {
    static updatePieceAnimations(delta_time) {
        for (const piece of this.pieces) {
            piece.update(delta_time / 1e3);
        }
    }

    static initPieces() {
        // In order to handle inits after the first one
        this.pieces = [];

        for (let i = 0; i < 4; ++i) {
            this.pieces.push(new Piece(0, i, "green"));
        }

        for (let i = 0; i < 4; ++i) {
            this.pieces.push(new Piece(1, i, "yellow"));
        }
    }

    static getPieces() {
        return this.pieces;
    }

    static removePiece(piece) {
        if (piece.color === "yellow") {
            const row = Math.floor(num_yellow_removed_pieces / 13);
            piece.setTarget(
                -(row + 1.5),
                -(BOARD_MARGIN + SQUARE_SIZE + 1) + num_yellow_removed_pieces % 13 + (row ? 0.5 : 0)
            );
        } else if (piece.color === "green") {
            const row = Math.floor(num_green_removed_pieces / 13);
            piece.setTarget(
                row + 10.5,
                -(BOARD_MARGIN + SQUARE_SIZE + 1) + num_green_removed_pieces % 13 + (row ? 0.5 : 0)
            );
        }
    }

    static performMove(row, column) {
        const color = GameState.getCurrentPlayerColor();
        if (!piece) {
            return;
        }
        piece.setTarget(row, column);
    }

    static undoMove(row, column) {
        const piece = this.getPieceAt(row, column);
        this.removePiece(piece);
    }

    static performMove(origin_row, origin_column, target_row = null, target_column = null) {
        const piece = this.getPieceAt(origin_row, origin_column);
        if (!piece) {
            return;
        }
        piece.setTarget(target_row, target_column);
    }

    static undoMove(origin_row, origin_column, target_row, target_column) {
        this.performMove(target_row, target_column, origin_row, origin_column);
    }

    static getPieceAt(row, column) {
        for (const piece of this.pieces) {
            if (piece.row === row && piece.column === column) {
                return piece;
            }
        }
        return null;
    }

    static setHighlightedSquare(square) {
        this.highlighted_square = square;
    }

    static getHighlightedSquare() {
        return this.highlighted_square;
    }
};

BoardState.highlighted_square = null;
BoardState.pieces = [];