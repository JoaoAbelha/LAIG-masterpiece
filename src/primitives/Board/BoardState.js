const BOARD_SIZE = 4;
const BOARD_MARGIN = BOARD_SIZE / 32;
const SQUARE_SIZE = (BOARD_SIZE - 2*BOARD_MARGIN)/10;

class BoardState {
    static updatePieceAnimations(delta_time) {
        for (const piece of this.pieces) {
            piece.update(delta_time/1e3);
        }
    }

    static initPieces(board_pieces = []) {
        // In order to handle inits after the first one
        this.pieces = [];

        for (let i = 0; i < board_pieces.length; ++i) {
            for (let j = 0; j < board_pieces[i].length; ++j) {
                // Blank space
                if (board_pieces[i][j] === 0) {
                    continue;
                }
                
                this.pieces.push(new Piece(j, i, board_pieces[i][j]));
            }
        }
    }

    static getPieces() {
        return this.pieces;
    }

    static removePiece(piece) {
        if (piece.color === "yellow") {
            const row = Math.floor(num_yellow_removed_pieces/13);
            piece.setTarget(
                -(row + 1.5), 
                -(BOARD_MARGIN + SQUARE_SIZE + 1) + num_yellow_removed_pieces%13 + (row ? 0.5 : 0)
            );
        } else if (piece.color === "green") {
            const row = Math.floor(num_green_removed_pieces/13);
            piece.setTarget(
                row + 10.5, 
                -(BOARD_MARGIN + SQUARE_SIZE + 1) + num_green_removed_pieces%13 + (row ? 0.5 : 0)
            );
        }
    }

    static performInsert(piece, row, column) {
        if (!piece) {
            return;
        }
        piece.setTarget(row, column);
    }

    static undoInsert(row, column) {
        const piece = this.getPieceAt(row, column);
        this.removePiece(piece);
    }

    static performMove(origin_row, origin_column, target_row, target_column) {
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