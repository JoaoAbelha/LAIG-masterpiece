:- use_module(library(system)).
:- ensure_loaded('player_chooser.pl').
:- ensure_loaded('input.pl').
:- ensure_loaded('bots.pl').

/* initial_player(-Player)
   chooses the first type of player
*/
initial_player(player(1, Type)) :-
    choose_player(Type).

/* initial_player(-Player)
   chooses the second type of player
*/
second_player(player(2, Type)) :-
    choose_player(Type).

/*possible players*/
is_human(1).
is_random_ai(2).
is_greedy_ai(3).
is_smart_ai(4).

get_random_element(List, Element) :-
    length(List, _N),
    random(0, _N, RandN),
    nth0(RandN, List, Element), !.

choose_move(Type, _, Move, _, _, NTurns) :-
    is_human(Type), !,
    (
        NTurns =< 8,
        read_coords(Col, Row),
        Move = move(Col, Row);
        NTurns > 8,
        read_coords(SrcCol, SrcRow),
        read_coords(DestCol, DestRow),
        Move = move(SrcCol, SrcRow, DestCol, DestRow)
    ).

choose_move(Type, game_state(Board, Cels, _, _), Move, Piece, _, NTurns) :-
    is_random_ai(Type), !,
    (
        NTurns =< 8,
        findall(M, valid_move(Board, M), Moves),
        get_random_element(Moves, Move);
        NTurns > 8,
        findall(M, valid_move(Board, Cels, M, Piece), Moves), 
        get_random_element(Moves, Move)
    ).

choose_move(Type, game_state(Board, Cels, NFirst, NSecond), Move, CurrP, NextP, NTurns) :-
    is_greedy_ai(Type), !,
    (
        NTurns =< 2,
        findall(M, valid_move(Board, M), Moves),
        get_random_element(Moves, Move);
        NTurns > 2, 
        valid_moves(game_state(Board, Cels, NFirst, NSecond), CurrP, List),  
        greedy_move(List, CurrP, NextP, Move)
    ).

choose_move(Type, game_state(Board, Cels, NFirst, NSecond), Move, CurrP, NextP, NTurns) :-
    is_smart_ai(Type), !,
    (
        NTurns =< 2,
        findall(M, valid_move(Board, M), Moves),
        get_random_element(Moves, Move);
        NTurns > 2,
        alpha_beta(game_state(Board, Cels, NFirst, NSecond), CurrP, NextP, 3, -1000, 1000, Move, _Value)
    ).
