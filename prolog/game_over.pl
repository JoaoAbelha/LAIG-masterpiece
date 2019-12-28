
%%%%%%% File with functions to check if the game reached the final state %%%%%%%%

/*
  checkLine(+Row,+Piece)
  checks if there is 4 in a row
*/
checkLine([Row|R], Piece):-
	( 
		nth0(Index, Row, Piece),
	  	Index2 is Index + 1,
	  	nth0(Index2, Row, Piece),
	  	Index3 is Index2 + 1,
	  	nth0(Index3, Row, Piece),
	  	Index4 is Index3 + 1,
	  	nth0(Index4, Row, Piece), !;
	  	checkLine(R, Piece)
	).

/*
  checkCol(+Row,+Piece)
  checks if there is 4 pieces in a single column
*/
checkCol([Row, Row2, Row3, Row4|Rest], Piece):-
	(
		nth0(Index, Row, Piece),
		nth0(Index, Row2, Piece),
		nth0(Index, Row3, Piece),
		nth0(Index, Row4, Piece), !;
	 	checkCol([Row2, Row3, Row4|Rest], Piece)
	).

/*
  diagonal_up(+Row,+Piece)
  checks if there is 4 pieces in the diagonal up
*/
diagonal_up([Row1, Row2, Row3, Row4|Rest], Piece):-
	( 
	nth0(Index, Row1, Piece),
    	Index2 is Index + 1,
	nth0(Index2, Row2, Piece),
    	Index3 is Index2 + 1,
    	nth0(Index3, Row3, Piece),
    	Index4 is Index3 + 1,
        nth0(Index4, Row4, Piece), !;
        diagonal_up([Row2, Row3, Row4|Rest], Piece)
    ).

/*
  diagonal_down(+Row,+Piece)
  checks if there is 4 pieces in the diagonal down
*/
diagonal_down([Row1, Row2, Row3, Row4|Rest], Piece):-
    ( 
	nth0(Index, Row1, Piece),
    	Index2 is Index - 1,
    	nth0(Index2, Row2, Piece),
    	Index3 is Index2 - 1,
    	nth0(Index3, Row3, Piece),
    	Index4 is Index3 - 1,
        nth0(Index4, Row4, Piece), ! ;
        diagonal_down([Row2, Row3, Row4|Rest], Piece)
    ).	
/*
   game_over(+Board, +Piece)
   checks if the game reached its final state by checking if all pieces of the color Piece are in a row, column or diagonal
*/
%%still check: only can win after the fourth play (just performance enhancement)
game_over(Board, Piece) :-
	(  
		checkLine(Board, Piece);
		checkCol(Board, Piece);
		diagonal_up(Board, Piece);
		diagonal_down(Board, Piece)
	).