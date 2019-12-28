
/*
  choose_player(+Type)
  chooses the type of player
*/
choose_player(Type) :-
    print_options,
    catch(read(Type), _, fail),
    integer(Type),
    valid_difficulty(Type), !.

% The type of player retrieved is invalid
choose_player(Type) :-
    print_wrong, choose_player(Type).

% Text to be printed when a type of player is being picked
print_options :-
	write('================================='), nl,
	write('|          Straigth 4           |'), nl,
	write('|===============================|'), nl,
	write('|   Choose the type of player:  |'), nl,
	write('|                               |'), nl,
	write('|   1. Human                    |'), nl,
	write('|   2. Random                   |'), nl,
	write('|   3. Greedy                   |'), nl,
	write('|   4. Smart                    |'), nl,
	write('|                               |'), nl,
	write('================================='), nl.

/*
 valid_difficulty(+LevelOfDifficulty)
*/
valid_difficulty(1).
valid_difficulty(2).
valid_difficulty(3).
valid_difficulty(4).

% Message to show when the option inserted is invalid
print_wrong :-
    write('Wrong option, try again'),nl.
