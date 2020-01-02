const BOARD_SIZE = 4;
const BOARD_MARGIN = BOARD_SIZE / 10;
const SQUARE_SIZE = (BOARD_SIZE - 2 * BOARD_MARGIN) / 5;

const PIECE_OFFSET = 1.5;

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
            this.pieces.push(new Piece(-PIECE_OFFSET, i, "green"));
        }

        for (let i = 0; i < 4; ++i) {
            this.pieces.push(new Piece(BOARD_SIZE + PIECE_OFFSET, i, "yellow"));
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

    static getFreeOrigins(origins) {
        let free_origins = [];

        for(origin in origins) {
            if(this.getPieceAt(origin.x, origin.y)) {
                free_origins.push(origin);
            }
        }

        return free_origins;
    }

    static getPiecesOrigins(origins) {
        let pieces_origins = [];

        for(origin in origins) {
            if(this.getPieceAt(origin.x, origin.y)) {
                pieces_origins.push(origin);
            }
        }

        return pieces_origins;
    }

    static getPieceToInsert() {
        const color = GameState.getCurrentPlayerColor();

        if(color === 1) {
            let origins = this.getPiecesOrigins(this.green_pieces_origins);
            return origins[Math.floor(Math.random()*origins.length)];
        } else {
            let origins = this.getPiecesOrigins(this.yellow_pieces_origins);
            return origins[Math.floor(Math.random()*origins.length)];
        }
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