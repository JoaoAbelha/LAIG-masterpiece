:- ensure_loaded('board.pl').

/*
 get_cel_type(?Slope, ?Orientation).
*/
get_cel_type(-1.0, up).
get_cel_type(1.0, down).

/*
  valid_move(+Board,+Move)
  checks if a move is valid for turn <=8
*/
valid_move(Board, move(Col, Row)) :-
	insideBoard(Board, Col, Row),
	get_element(Board, empty, Col, Row).


/*
  valid_move(+Board, +Cels, -Move, +Piece)
  retrieves a valid move for a piece of Color Piece for turn > 8
*/
valid_move(Board, Cels, move(SrcCol, SrcRow, DestCol, DestRow), Piece) :-
	insideBoard(Board, SrcCol, SrcRow),
	insideBoard(Board, DestCol, DestRow),
	get_element(Board, empty, DestCol, DestRow),
	get_element(Board, Piece, SrcCol, SrcRow),
	is_adjacent(move(SrcCol, SrcRow, DestCol, DestRow), Cels).


/*
  is_adjacent(+Move, +Cels)
  checks if Move correspondes to a valid move( to an adjacent cel) 
*/		
is_adjacent(move(SrcCol, SrcRow, DestCol, DestRow), Cels) :-
	is_diagonal(move(SrcCol, SrcRow, DestCol, DestRow)), !,
	Delta_X is abs(SrcCol - DestCol),
	Delta_Y is abs(SrcRow - DestRow),
	Delta_X < 2, Delta_Y < 2,
	get_slope(move(SrcCol, SrcRow, DestCol, DestRow), Slope),
	get_cel_type(Slope, Piece),
	check_cel(move(SrcCol, SrcRow, DestCol, DestRow), Cels, Piece).

is_adjacent(move(SrcCol, SrcRow, DestCol, DestRow), _) :-
	Delta_X is abs(SrcCol - DestCol),
	Delta_Y is abs(SrcRow - DestRow),
	Delta_X < 2, Delta_Y < 2.

/*
  is_diagonal(+Move)
  checks if Move is a diagonal move
*/
is_diagonal(move(SrcCol, SrcRow, DestCol, DestRow)) :-
    AbsDif_X is abs(DestCol - SrcCol),
    AbsDif_Y is abs(DestRow - SrcRow),
    AbsDif_X =:= AbsDif_Y.

/*
  get_slope(+Move,-Slope)
  calculates the slope of a move
*/
get_slope(move(SrcCol, SrcRow, DestCol, DestRow), Slope):-
	Delta_X is SrcCol - DestCol,
	Delta_Y is SrcRow - DestRow,
	Slope is Delta_X/Delta_Y.

/*
  check_cel(+Move, +Cels, +Pieces)
  check if a move is possible in a cel
*/
check_cel(move(SrcCol, SrcRow, DestCol, DestRow), Cels, Piece) :-
    MinRow is min(SrcRow, DestRow), 
    MinCol is min(SrcCol, DestCol),
    get_element(Cels, PieceGot, MinCol, MinRow),
    PieceGot = Piece.

/*
  move_piece(+Move, +Piece, +BoardIn, -BoardOut)
  swaps empty and Piece in the BoardIn, according to the made move and retrieves the new Board in BoardOut
  
*/
move_piece(move(SrcCol, SrcRow, DestCol, DestRow), Piece, BoardIn, BoardOut) :- !,
	set_matrix_element_pos(BoardIn, Bout, empty, SrcCol, SrcRow),
	set_matrix_element_pos(Bout, BoardOut, Piece, DestCol, DestRow).

move_piece(move(Col, Row), Piece, BoardIn, BoardOut) :- !,
	set_matrix_element_pos(BoardIn, BoardOut, Piece, Col, Row).

/*
  move(+GameState,+Piece, +Move,-BoardOut)
  retrieves a possible move
  
*/	
move(game_state(Board, Cels, 4, 4), Piece, Move, BoardOut) :- !,
	valid_move(Board, Cels, Move, Piece),
	move_piece(Move, Piece, Board, BoardOut).

move(game_state(Board, _, _, _), Piece, Move, BoardOut) :- !,
	valid_move(Board, Move),
	move_piece(Move, Piece, Board, BoardOut).
/*
  valid_moves(+Game, +Piece, -ListOfMoves)
  retrieves all possible moves for one player depending on the Piece color
  
*/
valid_moves(Game, Piece, ListOfMoves) :-
	findall(Move-BoardOut, move(Game, Piece, Move, BoardOut), ListOfMoves).


