:-use_module(library(lists)).
:-use_module(library(random)).
:- ensure_loaded('movement.pl').
:- ensure_loaded('player.pl').
:- ensure_loaded('game_over.pl').

/*
   inital_game_state(-InitialGameState)
   Called to intialize the game state with its initial information
*/
initial_game_state(game_state(Board,Cels,NFirst,NSecond)) :-
	emptyBoard(Board),
	cels(Cels),
	getNrPieces(Board, green, NFirst),
	getNrPieces(Board, yellow, NSecond).

/*
   nextTurn(+GameState,-GameStateOut,-BoardOut)
   Called to change turn by updating the game state: the board, the player turn 
*/
nextTurn(game_state(_, Cels, _, _), game_state(BoardOut, Cels, NFirst2, NSecond2), BoardOut) :-
	getNrPieces(BoardOut, green, NFirst2),
	getNrPieces(BoardOut, yellow, NSecond2).

%%%%%%%%%%%%%%%%%%%%%% * Print menus * %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

print_menu :-
	write('================================='), nl,
	write('|          Straigth 4           |'), nl,
	write('|===============================|'), nl,
	write('       Choose an option:        |'), nl,
	write('|                               |'), nl,
	write('|   1. Play                     |'), nl,
	write('|   2. Credits                  |'), nl,
	write('|   0. Exit                     |'), nl,
	write('|                               |'), nl,
	write('================================='), nl.

print_credits :-
	write('================================='), nl,
	write('|          Straigth 4           |'), nl,
	write('|===============================|'), nl,
	write('|           Credits:            |'), nl,
	write('|    This beautiful game        |'), nl,
	write('|       was made by:            |'), nl,
	write('|                               |'), nl,
	write('|   * JOAO ABELHA               |'), nl,
	write('|   * VITOR BARBOSA             |'), nl,
	write('|                               |'), nl,
	write('|   0 - Back                    |'), nl,
	write('================================='), nl.

%%%%%%%%%%%%%%%%%%%% * Menu handling-- * %%%%%%%%%%%%%%%%%%%%

/*
  main_menu
    prints the main menu and waits for a valid option from the user to change
    the menu state
*/
main_menu:-
	print_menu,
	catch(read(Option), _, fail),
	integer(Option),
	choose_main_menu(Option).

choose_main_menu(Option):-
	Option == 1, write('Play the game'), nl, !;
	Option == 0, write('Exiting the game... Goodbye'), nl, !, fail;
	Option == 2, nl, credits_menu.
	
choose_main_menu(_):-  main_menu.

/*
  credits_menu
  prints the credits menu
*/
credits_menu:-
	print_credits,
	catch(read(Option), _, fail),
	integer(Option),
	Option =:= 0, main_menu;
	credits_menu.

%%%%%%%%%%%%%%%%%%%%%% * Human Move * %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

/*
  start_game
  * function to start the game before playing
*/
start_game :-
	now(TS),
    setrand(TS),
	initial_game_state(Game),
	main_menu,
	initial_player(P1),
	second_player(P2),
	play_game(Game, P1, P2, 1).

/*
  display_winner(+Piece)
   function to display the winner
*/
display_winner(Piece) :- 
    write('Player '), write(Piece), write(' won!'), nl, fail.

/*
  display_invalid
  function to display some basic rules if any invalid move is made
*/
display_invalid_move :-
	format("You made a invalid move",[]), nl,
	format("You can only move a piece to an adjacent vertex of the board!",[]), nl,
	format("Please try again, having that in consideration",[]), nl,
	pressEnter, pressEnter, nl.

/*
  play_game(+GameState, +Player1, +Player2, +TurnNumber)
  modular function used to play the game between players (humans and bots)
*/
play_game(game_state(Board, Cels, _, _), player(CurrP, _CurrType), player(NextP, _NextType), NTurns) :-
	printGameStatus(NTurns), %% shows the turn
	printBoard(Board,Cels),  %% prints the board
	currentPlayerStatus(CurrP, Board), nl,
	(       %% checks for a winner
		game_over(Board, CurrP), !, display_winner(CurrP); 
		game_over(Board, NextP), !, display_winner(NextP)	
	).

play_game(GameState, player(CurrP, CurrType), player(NextP, NextType), NTurns) :-
    choose_move(CurrType, GameState, Move, CurrP, NextP, NTurns), %% choose move to make
    move(GameState, CurrP, Move, BoardOut), !, %% make a valid move
    NTurns2 is NTurns + 1,
    nextTurn(GameState, NewGameState, BoardOut), %% change the turn
    play_game(NewGameState, player(NextP, NextType), player(CurrP, CurrType), NTurns2). %% game loop

play_game(GameState, CurrP, NextP, NTurns) :-
    display_invalid_move, !, play_game(GameState, CurrP, NextP, NTurns). %% invalid move was made


