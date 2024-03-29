const BOARD_SIZE = 4;
const BOARD_MARGIN = BOARD_SIZE / 32;
const SQUARE_SIZE = (BOARD_SIZE - 2 * BOARD_MARGIN) / 5;
const PIECE_OFFSET = 2;

class BoardState {
    static updatePieceAnimations(delta_time) {
        for (const piece of this.pieces) {
            piece.update(delta_time / 1e3);
        }
    }

    static initPieces() {
        // In order to handle inits after the first one
        this.pieces = [];
        this.green_pieces_origins = [];
        this.yellow_pieces_origins = [];

        for (let i = 0; i < 4; ++i) {
            let origin = {
                column: -PIECE_OFFSET,
                row: i
            };
            this.green_pieces_origins.push(origin);
            this.pieces.push(new Piece(origin.column, origin.row, "green"));
        }

        for (let i = 0; i < 4; ++i) {
            let origin = {
                column: BOARD_SIZE + PIECE_OFFSET,
                row: i
            };
            this.yellow_pieces_origins.push(origin);
            this.pieces.push(new Piece(origin.column , origin.row, "yellow"));
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

    static performMove(origin_column, origin_row, target_column, target_row) {
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

        for(let i = 0; i < origins.length; ++i) {
            let origin = origins[i];
            if (!this.getPieceAt(origin.row, origin.column)) {
                free_origins.push(origin);
            }
        }
        console.log(pieces_origins);
        return free_origins;
    }

    static getPiecesOrigins(origins) {
        let pieces_origins = [];

        for(let i = 0; i < origins.length; ++i) {
            let origin = origins[i];
            if (this.getPieceAt(origin.row, origin.column)) {
                pieces_origins.push(origin);
            }
        }

        return pieces_origins;
    }

    static getPieceToInsert(color) {
        if (color === 1) {
            let origins = this.getPiecesOrigins(this.green_pieces_origins);
            return origins[Math.floor(Math.random() * origins.length)];
        } else {
            let origins = this.getPiecesOrigins(this.yellow_pieces_origins);
            return origins[Math.floor(Math.random() * origins.length)];
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