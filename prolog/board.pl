:- use_module(library(between)).
:-ensure_loaded('list.pl').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% Section with information about the board %%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 getPos(?Type,?Interface)
 get the corresponding state and interface of a position
*/
getPos(empty,' ').
getPos(green,'G').
getPos(yellow,'Y').


/*
 getCel(?Cel, ?Interface)
 get the corresponding cel and its interface
*/
getCel(empty,' ').
getCel(up,'/').
getCel(down,'\\').


/*just some board states:*/

emptyBoard([[empty,empty, empty, empty, empty],
        [empty,empty, empty, empty, empty],
        [empty,empty, empty, empty, empty],
        [empty,empty, empty, empty, empty],
        [empty,empty, empty, empty, empty]
]). %% empty board that corresponds to the inital state of the board


e1stateBoard([[empty,empty, empty, empty, empty],
              [green,empty, empty, yellow, empty],
              [empty,empty, empty, empty, empty],
              [empty,empty, empty, empty, empty],
              [empty,empty, empty, empty, empty]
]).


e2stateBoard([[empty,empty, empty, empty, empty],
              [green,green, green, empty, green],
              [empty,yellow, empty, empty, yellow],
              [yellow,empty, empty, yellow, empty],
              [empty,empty, empty, empty, empty]
]).

finalStateBoard([[empty,empty, empty, empty, empty],
            [green,green, green, yellow, empty],
            [green,empty, empty, yellow, empty],
            [empty,empty, empty, yellow, empty],
            [empty,empty, empty, yellow, empty]
]).

/*
  cels(-Cels)
  get the cels of the board
*/
cels([[empty,up, down, empty],
      [up, up, down, down],
      [down, down, up, up],
      [empty, down, up, empty]
]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%% Section used to print the board %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

/*
 printGameStatus(+NrTurns)
 prints the turn number of the game
*/
printGameStatus(NrTurns):-
	    format("~n       #-#-# Straight4 #-#-#~n~n PLAY NUMBER ~d:",[NrTurns]).

/*
  printRowNumber(+Number)
  just prints the row number with some space in both sides
*/
printRowNumber(LineNumber) :-
    write(' '), write(LineNumber), write(' ').

/*
  printRow_Rest(+RestRow)
  writes in the console output the cels of a row
*/
printRow_Rest([]).

printRow_Rest([Cel| Rest]):-
    getPos(Cel,Symbol),
    format('____~s',[Symbol]),
    printRow_Rest(Rest).

/*
  printRow(+Row)
  prints a entire row
*/
printRow([Cel|Rest]):-
    getPos(Cel,Symbol),
    format('  ~s',[Symbol]),
    printRow_Rest(Rest).

/*
  drawCelsRest(+RestCels)
  draws the corresponding symbol of a cell for the rest of a row
*/
drawCelsRest([]).

drawCelsRest([Cel| Rest]):-
    getCel(Cel,Symbol),
    format(" ~a  |",[Symbol]),
    drawCelsRest(Rest).


/*
  drawCels(+Row)
  draws all the cels of a row
*/
drawCels([Cel|Rest]):-
    write('     |'),
    getCel(Cel,Symbol),
    format(" ~a  |",[Symbol]),
    drawCelsRest(Rest).


/*
   printColumnNumbers(+Number)
   prints all the column numbers
*/
printColumnNumbers(N) :-
    write(' '),
    printColumnNumbers_aux(N), nl.

printColumnNumbers_aux(0).

printColumnNumbers_aux(N) :-
    N1 is N - 1,
    printColumnNumbers_aux(N1),
    write('    '),write(N1).

/*
 printBoardRest(+Positions,+Cels,+LineNumber)
 to print the rest of the board
*/
printBoardRest([],[],_).

printBoardRest([HeadOfTheBoard | _],[],LineNumber) :-
    printRowNumber(LineNumber),
    printRow(HeadOfTheBoard),nl.

printBoardRest([HeadOfTheBoard | TailOfTheBoard],[HeadOfTheCells| TailOfTheCells], LineNumber):-
    printRowNumber(LineNumber),
    printRow(HeadOfTheBoard),nl,
    drawCels(HeadOfTheCells),nl,
    NextLineNumber is LineNumber + 1,
    printBoardRest(TailOfTheBoard,TailOfTheCells, NextLineNumber).

/*
   printBoardRest(+Positions,+Cels)
   prints all the board by calling other functions
*/
printBoard([HeadOfTheBoard | TailOfTheBoard],Cells) :-
    nl,
    length(HeadOfTheBoard, NumberOfColumns),
    printColumnNumbers(NumberOfColumns),
    nl,
    printBoardRest([HeadOfTheBoard | TailOfTheBoard], Cells, 0), !.

/*
  getNrPieces(+Board,+TypePieces, -NumberPieces)
  given a board and a type of piece it retrieves the number of that type in the board
*/
getNrPieces(Board,TypePieces, NumberPieces):-
	getBoardNrElements(Board,NumberPieces, TypePieces).

/*
  currentPlayerStatus(+Piece, +Board)
  displays the player status by outputing the number of pieces it has in the board
*/
currentPlayerStatus(Piece, Board):-
	getNrPieces(Board, Piece, NumberPieces),
    nl,
    format("Player ~s: ~d/4 pieces in the board",[Piece,NumberPieces]), !.


/*
  insideBoard(+Board,+X, +Y)
  checks if a piece is inside the board
*/
insideBoard([HeadOfTheBoard | TailOfTheBoard], X, Y) :-
    length(HeadOfTheBoard, BoardLengthY),
    BoardLenY is BoardLengthY - 1,
    between(0, BoardLenY, Y),
    length(TailOfTheBoard, BoardLenX),
    between(0, BoardLenX, X).


/*
  board_size(+Board, -LineSize,-ColumnSize)
  given a board it retrives its size
*/
board_size(Board, LinesSize, ColumnsSize) :-
    Board = [HeadOfTheBoard | _],
    length(Board, LinesSize),
    length(HeadOfTheBoard, ColumnsSize).

