:- use_module(library(between)).
:-ensure_loaded('list.pl').

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% Section with information about the board %%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


/*
 getPos(?Type,?Interface)
 get the corresponding state and interface of a position
*/
getPos(0,' ').
getPos(1,'G').
getPos(2,'Y').


/*
 getCel(?Cel, ?Interface)
 get the corresponding cel and its interface
*/
getCel(0,' ').
getCel(1,'/').
getCel(2,'\\').


/*just some board states:*/

emptyBoard([[0,0, 0, 0, 0],
        [0,0, 0, 0, 0],
        [0,0, 0, 0, 0],
        [0,0, 0, 0, 0],
        [0,0, 0, 0, 0]
]). %% empty board that corresponds to the inital state of the board


e1stateBoard([[0,0, 0, 0, 0],
              [1,0, 0, 2, 0],
              [0,0, 0, 0, 0],
              [0,0, 0, 0, 0],
              [0,0, 0, 0, 0]
]).


e2stateBoard([[0,0, 0, 0, 0],
              [1,1, 1, 0, 1],
              [0,2, 0, 0, 2],
              [2,0, 0, 2, 0],
              [0,0, 0, 0, 0]
]).

finalStateBoard([[0,0, 0, 0, 0],
            [1,1, 1, 2, 0],
            [1,0, 0, 2, 0],
            [0,0, 0, 2, 0],
            [0,0, 0, 2, 0]
]).

/*
  cels(-Cels)
  get the cels of the board
*/
cels([[0,1, 2, 0],
      [1, 1, 2, 2],
      [2, 2, 1, 1],
      [0, 2, 1, 0]
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
  write(piece),nl,
	getNrPieces(Board, Piece, NumberPieces),
    nl,
    format("Player: ~d/4 pieces in the board",[NumberPieces]), !.


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

