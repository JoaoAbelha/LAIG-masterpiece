/*functions to read the user input*/

pressEnter:-
	get_char(_), !.

get_input(Char):-
	get_char(Char),
	get_char(_), !.
get_input(_).

readInput(Input):-
	get_code(Ch),
	readRest(Ch,AllChars),
	name(Input, AllChars).

readRest(10,[]).
readRest(13, []).
readResret(Ch,[Ch|Rest]):-
	get_code(Ch1),
	readRest(Ch1,Rest).

%% por exemplo para input de 1... "1."
read_inteiro(X, Str):-
	repeat,
	format("Coords of ~s: ",[Str]),
	catch(read(X), _, fail),
	integer(X), !.

read_coords(X,Y) :-
	read_inteiro(X, "x"),
	read_inteiro(Y, "y"), !.
