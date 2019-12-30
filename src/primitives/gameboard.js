/*hardcoded values we need to get the values from the board state */
const current_pieces = [{row:0, column:0, color: "black", height:0.2},{row:4, column:1, color: "white", height:0.2},{row:1, column:2, color: "white", height:0.2}];//BoardState.getPieces();


class gameboard  extends CGFobject {

	constructor(scene, texture_id) {
        super(scene);

        /*create the gameboard variables */
        this.scene = scene;
        this.board_size = BOARD_SIZE;
        this.board_height = 0.3;
        this.board_margin = BOARD_MARGIN;
        this.square_size = SQUARE_SIZE;
        this.piece_offset = this.board_margin + this.square_size/2;
        this.piece_size = this.board_size / 16;

        /*create the objects related to the gameBoard*/
        this._createBoard(this.board_size);
        this._createPiece();
        /*materials and textures */
        this._loadBoardTexture(texture_id);
        this._createMaterials();


        this._createTouchSquare();
        this.createHighlight();

    };

    /**
     * creates the primitives neeeded to display the board
     * @param {number of divisions the primitives will have} divisions 
     */
    _createBoard(divisions) {
        this.board_cover = new MyPlane(this.scene, divisions, divisions);
        this.board_edge = new MyPlane(this.scene, divisions, 1);
    }

    /**
     * 
     */
    _createPiece() {
        this.play_piece = new Mushroom(this.scene,this.piece_size, 5, 5);
    }

       /**
     * 
     * @param {*} texture_id 
     */
    _loadBoardTexture(texture_id) {
        this._texture = this.scene.textures[texture_id];
    }


    /**
     * creates the materials used in the board
     */
    _createMaterials() {

        this._board_material = new CGFappearance(this.scene);
        this._board_material.setAmbient(0.3, 0.3, 0.3, 1);
        this._board_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this._board_material.setSpecular(0.3, 0.3, 0.3, 1);
        this._board_material.setEmission(0, 0, 0, 1);
        this._board_material.setShininess(10);
        this._board_material.setTexture(this._texture);

        
        this.highlighted_material = new CGFappearance(this.scene);
        this.highlighted_material.setAmbient(0.15, 0.15, 0, 1);
        this.highlighted_material.setDiffuse(0.5, 0.5, 0, 1);
        this.highlighted_material.setSpecular(0.3, 0.3, 0, 1);
        this.highlighted_material.setEmission(0, 0, 0, 1);
        this.highlighted_material.setShininess(25);

        
        this.board_cover_material = new CGFappearance(this.scene);
        this.board_cover_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_cover_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_cover_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_cover_material.setEmission(0, 0, 0, 1);
        this.board_cover_material.setShininess(25);
        this.board_cover_texture= new CGFtexture(this.scene, "scenes/images/board.PNG");

        this.board_cover_material.setTexture(this.board_cover_texture);

        this.board_bottom_material = new CGFappearance(this.scene);
        this.board_bottom_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_bottom_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_bottom_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_bottom_material.setEmission(0, 0, 0, 1);
        this.board_bottom_material.setShininess(25);

        this.board_edge_material = new CGFappearance(this.scene);
        this.board_edge_material.setAmbient(0.15, 0.15, 0.15, 1);
        this.board_edge_material.setDiffuse(0.5, 0.5, 0.5, 1);
        this.board_edge_material.setSpecular(0.3, 0.3, 0.3, 1);
        this.board_edge_material.setEmission(0, 0, 0, 1);
        this.board_edge_material.setShininess(25);

        this.piece_material = {};
        this.piece_material["black"] = new CGFappearance(this.scene);
        this.piece_material["black"].setAmbient(0.15, 0.15, 0.15, 1);
        this.piece_material["black"].setDiffuse(0.5, 0.5, 0.5, 1);
        this.piece_material["black"].setSpecular(0.3, 0.3, 0.3, 1);
        this.piece_material["black"].setEmission(0, 0, 0, 1);
        this.piece_material["black"].setShininess(25);
        this.piece_material["black"].setTexture(this.black_piece_texture);

        this.piece_material["white"] = new CGFappearance(this.scene);
        this.piece_material["white"].setAmbient(0.15, 0.15, 0.15, 1);
        this.piece_material["white"].setDiffuse(0.5, 0.5, 0.5, 1);
        this.piece_material["white"].setSpecular(0.3, 0.3, 0.3, 1);
        this.piece_material["white"].setEmission(0, 0, 0, 1);
        this.piece_material["white"].setShininess(25);
        this.piece_material["white"].setTexture(this.white_piece_texture);
    }

    /*
    *
    */
    createHighlight() {
        this.highlight = new MyPlane(this.scene, 1, 1);
    }

    /**
     * 
     */
    _createTouchSquare() {
        this.touch_square = new MyPlane(
          this.scene, 1,1
        );
        this.touch_square.pickingEnabled = true;
    }

    /**
     * 
     * @param {*} row 
     * @param {*} column 
     */
    drawTouchSquare(row, column) {
        this.scene.pushMatrix();
           this.scene.translate(this.piece_offset + this.square_size*column, this.board_height + 0.001, this.piece_offset + this.square_size*row);
          this.scene.scale(this.square_size, 1, this.square_size);
          this.scene.registerForPick(row*1 + column, this.touch_square);
            this.touch_square.display();
        this.scene.popMatrix();
    }

    /**
     * 
     */
    drawTouchSquares() {
        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                this.drawTouchSquare(i, j);
            }
        }
        this.scene.registerForPick(100, null);
    }

    /**
     * 
     */
    drawPieces() {

        for (const piece of current_pieces) {
            this.drawPiece(piece);
        }
    }

    /**
     * 
     */
    drawHighlightedSquare() {
        const current_highlighted_square = BoardState.getHighlightedSquare();
    
        if (!current_highlighted_square) {
            return;
        }

        this.scene.pushMatrix();
            this.scene.translate(
                this.piece_offset + this.square_size*current_highlighted_square.column, 
                this.board_height + 0.001, 
                this.piece_offset + this.square_size*current_highlighted_square.row
            );
            this.scene.scale(0.165, 1, 0.165);
            this.scene.rotate(-Math.PI/2, 1, 0, 0);
            this.highlighted_material.apply();
            this.highlight.display();
        this.scene.popMatrix();
    }

    setCustomPieces(white_piece, black_piece) {
        this.white_piece = white_piece;
        this.black_piece = black_piece;
    }

    prepareFallbackPiece(piece) {
        this.piece_material[piece.color].apply();
    }

    getCustomOrFallbackPiece(piece) {
        switch(piece.color) {
            case "white":
                if (this.white_piece) {
                    return this.white_piece;
                } else {
                    this.prepareFallbackPiece(piece);
                    return this.play_piece;
                }
            case "black":
                if (this.black_piece) {
                    return this.black_piece;
                } else {
                    this.prepareFallbackPiece(piece);
                    return this.play_piece;
                }
            default:
                break;
        }
    }

    drawPiece(piece) {
        this.scene.pushMatrix();
            const piece_to_display = this.getCustomOrFallbackPiece(piece);
            this.scene.translate(this.piece_offset + this.square_size*piece.column -0.15, this.board_height + piece.height, this.piece_offset + this.square_size*piece.row- 0.15);
            this.scene.scale(this.piece_size, this.piece_size, this.piece_size);
            this.scene.registerForPick(piece.row * 10 + piece.column, this.play_piece);
            piece_to_display.display();
        this.scene.popMatrix();
    }

    drawPieces() {
        for (const piece of current_pieces) {
            this.drawPiece(piece);
        }
    }

    /**
     * 
     */
    display() {

    if (this.scene.pickMode) {
        this.drawTouchSquares();    
    }

this.scene.pushMatrix();

    this.drawPieces();
    //this.drawHighlightedSquare();
    this.scene.translate(this.board_size/2, 0, this.board_size/2);
    
    this.scene.pushMatrix();
        this.scene.translate(0, this.board_height, 0);
        this.scene.scale(this.board_size, this.board_size, this.board_size);
        this.board_cover_material.apply();
        this.board_cover.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.scene.scale(this.board_size, this.board_size, this.board_size);
        this.board_bottom_material.apply();
        this.board_cover.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
        this.scene.translate(0, this.board_height/2, this.board_size/2);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
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



}
