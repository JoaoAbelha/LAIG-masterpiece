/**
 * Board
 * @constructor
 */
class Board extends CGFobject {
    constructor(scene, tex) {
        super(scene);

        this.board_size = BOARD_SIZE;
        this.board_height = 0.3;
        this.board_margin = BOARD_MARGIN;
        this.square_size = SQUARE_SIZE;
        this.piece_offset = this.board_margin + this.square_size / 2;
        this.piece_size = this.board_size / 10;

        this.createHighlight();
        this.createTouchSquare();
        this.createBoard();
        this.createPiece();
        this.initMaterials(tex);
    };

    display() {
        if (this.scene.pickMode)
            this.drawTouchSquares();


        this.drawPieces();
        this.drawHighlightedSquare();

        this.scene.translate(this.board_size / 2, 0, this.board_size / 2);
        // Board Cover
        this.scene.pushMatrix();
        this.scene.translate(0, this.board_height, 0);
        this.scene.scale(this.board_size, this.board_size, this.board_size);
        this.board_cover_material.apply();
        this.board_cover.display();
        this.scene.popMatrix();

        // Board Bottom
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.scene.scale(this.board_size, this.board_size, this.board_size);
        this.board_bottom_material.apply();
        this.board_cover.display();
        this.scene.popMatrix();

        // Board edges
        this.scene.pushMatrix();
        this.scene.translate(0, this.board_height / 2, this.board_size / 2);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.board_size, 0, this.board_height);
        this.board_edge_material.apply();
        this.board_edge.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, this.board_height / 2, this.board_size / 2);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.board_size, 0, this.board_height);
        this.board_edge_material.apply();
        this.board_edge.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.translate(0, this.board_height / 2, this.board_size / 2);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.board_size, 0, this.board_height);
        this.board_edge_material.apply();
        this.board_edge.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, this.board_height / 2, this.board_size / 2);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.board_size, 0, this.board_height);
        this.board_edge_material.apply();
        this.board_edge.display();
        this.scene.popMatrix();
    }

    createTouchSquare() {
        this.touch_square = new MyPlane(this.scene, 1, 1);
        this.touch_square.pickingEnabled = true;
    }

    createBoard() {
        this.board_cover = new MyPlane(this.scene, 20, 20);
        this.board_edge = new MyPlane(this.scene, 20, 4);
        this.piece_supporters = new Cube(this.scene);
    }

    createPiece() {
        this.piece = new Mushroom(this.scene, this.piece_size);
    }

    initMaterials(board_tex) {
        this.board_cover_texture = board_tex ? this.scene.textures[board_tex] : new CGFtexture(this.scene, ("primitives/resources/board.jpg"));

        this.board_edge_texture = new CGFtexture(this.scene, "primitives/resources/board_edge.jpg");
        this.board_bottom_texture = new CGFtexture(this.scene, "primitives/resources/board_bottom.jpg");
        this.yellow_piece_texture = new CGFtexture(this.scene, "primitives/resources/white_piece.jpg");
        this.green_piece_texture = new CGFtexture(this.scene, "primitives/resources/white_piece.jpg");
        this.piece_material = {};

        this.board_cover_material = new CGFappearance(this.scene);
        this.board_cover_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_cover_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_cover_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_cover_material.setEmission(0, 0, 0, 1);
        this.board_cover_material.setShininess(25);
        this.board_cover_material.setTexture(this.board_cover_texture);

        this.board_edge_material = new CGFappearance(this.scene);
        this.board_edge_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_edge_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_edge_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_edge_material.setEmission(0, 0, 0, 1);
        this.board_edge_material.setShininess(25);
        this.board_edge_material.setTexture(this.board_edge_texture);

        this.board_bottom_material = new CGFappearance(this.scene);
        this.board_bottom_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_bottom_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_bottom_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_bottom_material.setEmission(0, 0, 0, 1);
        this.board_bottom_material.setShininess(25);
        this.board_bottom_material.setTexture(this.board_bottom_texture);

        this.highlighted_material = new CGFappearance(this.scene);
        this.highlighted_material.setAmbient(0.15, 0.05, 0, 1);
        this.highlighted_material.setDiffuse(0.5, 0.3, 0, 1);
        this.highlighted_material.setSpecular(0.3, 0.1, 0, 1);
        this.highlighted_material.setEmission(0, 0, 0, 1);
        this.highlighted_material.setShininess(25);

        this.piece_material["yellow"] = new CGFappearance(this.scene);
        this.piece_material["yellow"].setAmbient(0.15, 0.15, 0.0, 1);
        this.piece_material["yellow"].setDiffuse(0.5, 0.5, 0.0, 1);
        this.piece_material["yellow"].setSpecular(0.3, 0.3, 0.0, 1);
        this.piece_material["yellow"].setEmission(0, 0, 0, 1);
        this.piece_material["yellow"].setShininess(25);
        this.piece_material["yellow"].setTexture(this.yellow_piece_texture);

        this.piece_material["green"] = new CGFappearance(this.scene);
        this.piece_material["green"].setAmbient(0.0, 0.15, 0.0, 1);
        this.piece_material["green"].setDiffuse(0.0, 0.5, 0.0, 1);
        this.piece_material["green"].setSpecular(0.0, 0.3, 0.0, 1);
        this.piece_material["green"].setEmission(0, 0, 0, 1);
        this.piece_material["green"].setShininess(25);
        this.piece_material["green"].setTexture(this.green_piece_texture);
    }

    drawPieces() {
        const current_pieces = BoardState.getPieces();

        for (const piece of current_pieces) {
            this.drawPiece(piece);
        }
    }

    drawPiece(piece) {
        const clickid = (piece.column < 0 || piece.column > 4) ? piece.row * 7 + Math.abs(piece.column) + 30 : piece.row * 5 + piece.column;
        const piece_to_display = this.getCustomPiece(piece);

        this.scene.pushMatrix();
        this.scene.translate(this.piece_offset + this.square_size * piece.column, this.board_height + piece.height, this.piece_offset + this.square_size * piece.row);
        this.scene.scale(this.piece_size, this.piece_size, this.piece_size);
        this.scene.registerForPick(clickid, this.piece);
        piece_to_display.display();
        this.scene.popMatrix();
    }

    getCustomPiece(piece) {
        switch (piece.color) {
            case "green":
                if (this.green_piece) {
                    return this.green_piece;
                } else {
                    this.preparePiece(piece);
                    return this.piece;
                }
            case "yellow":
                if (this.yellow_piece) {
                    return this.yellow_piece;
                } else {
                    this.preparePiece(piece);
                    return this.piece;
                }
            default:
                break;
        }
    }

    preparePiece(piece) {
        this.piece_material[piece.color].apply();
    }

    setCustomPieces(green_piece, yellow_piece) {
        this.green_piece = green_piece;
        this.yellow_piece = yellow_piece;
    }

    drawTouchSquares() {
        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                this.drawTouchSquare(i, j);
            }
        }
        this.scene.registerForPick(25, null);
    }

    drawTouchSquare(row, column) {
        this.scene.pushMatrix();
        this.scene.translate(this.piece_offset + this.square_size * column, this.board_height + 0.001, this.piece_offset + this.square_size * row);
        this.scene.scale(this.square_size, 1, this.square_size);
        this.scene.registerForPick(row * 5 + column, this.touch_square);
        this.touch_square.display();
        this.scene.popMatrix();
    }

    createHighlight() {
        this.highlight = new MyCylinder(this.scene, 30, 30, 0, 1, 1);
    }

    drawHighlightedSquare() {
        const current_highlighted_square = BoardState.getHighlightedSquare();

        if (!current_highlighted_square) {
            return;
        }
        this.scene.pushMatrix();
        this.scene.translate(
            this.piece_offset + this.square_size * current_highlighted_square.column,
            this.board_height + 0.001,
            this.piece_offset + this.square_size * current_highlighted_square.row
        );
        this.scene.scale(0.25, 1, 0.25);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.highlighted_material.apply();
        this.highlight.display();
        this.scene.popMatrix();
    }
}