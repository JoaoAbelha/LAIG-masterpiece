:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

%%% Server config
print_headers(true).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'), nl, nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'), nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		% write('Accepted connection'), nl,

	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		write('Finished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply), error(_,_), fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /', Get),
    append(Get, RL, LineCodes),

    % Char codes and stuff
    read_request_aux(RL, RL2),   
	catch(read_from_codes(RL2, Request), error(syntax_error(_), _), fail), !.

read_request(_, syntax_error).
	
read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file), !.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines
print_header_line(LineCodes) :-
	print_headers(true), !,
	catch((atom_codes(Line,LineCodes), write(Line), nl), _, fail), !.

print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here
:-use_module('player_chooser.pl').
:-use_module('board.pl').
:-use_module('player.pl').
:-use_module('game.pl').
:-use_module('movement.pl').
:-use_module('bots.pl').
:-use_module('game_over.pl').

% for time/1
:- use_module(library(system)).

parse_input(handshake, handshake).

parse_input(quit, goodbye).


%%%%%%%%%%%%%%%%%%%%% /init

% Player difficulty
% 1 - human
% 2 - random
% 3 - greedy
% 4 - smart

parse_input(init/P1Dif/P2Dif, Res) :-
	% write('hey'), nl, write(P1Dif-P2Dif), nl,
	valid_difficulty(P1Dif), valid_difficulty(P2Dif), !,

	% Initializing a random seed to ensure new randomness in this game
	now(_Time),
    setrand(_Time),

	initial_game_state(game_state(Board, Cels, NGreen, NYellow)),
    NTurns = 1,

	Res = {
		'"success"': true,
		'"currp"': [green, P1Dif],
		'"nextp"': [yellow, P2Dif],
		'"board"': Board,
        '"cels"' : Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
        '"nTurns"': NTurns
	}.

parse_input(init/_P1Dif/_P2Dif, Res) :-
	Res = {
		'"success"': false,
		'"reason"': '"Provided player difficulties not valid!"'
	}.

%%%%%%%%%%%%%%%%%%%%% /insert

% Passed game is already over
parse_input(insert/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1], Res) :-
    (
        game_over(Board, CurrColor), Winner = CurrColor, !;
        game_over(Board, NextColor), Winner = NextColor, !
    ),

	Res = {
		'"success"': false,
		'"reason"': '"Game already over"',
		'"game_over"': true,
		'"winner"': Winner,

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"' : Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
        '"nTurns"': NTurns
	}.

% Checking if the current player can even move any pieces at all
parse_input(insert/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1], Res) :- 
	\+ is_human(CurrDif), !,

	Res = {
		'"success"': false,
		'"reason"': '"Current player is not human"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"' : Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
        '"nTurns"': NTurns
	}.

% Check for gameover after moving -> Move results in game over
parse_input(insert/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[X1, Y1], Res) :-
	% Only an human player can attempt to move
	is_human(CurrDif),

	GS = game_state(Board, Cels, NGreen, NYellow),
	Mov = move(X1, Y1),

	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut),
	(
        game_over(NewBoard, CurrColor), Winner = CurrColor, !;
        game_over(NewBoard, NextColor), Winner = NextColor, !
    ),

	NTurns2 is NTurns + 1,

	Res = {
		'"success"': true,

		'"game_over"': true,
		'"winner"': Winner,

		'"currp"': [NextColor, NextDif],
		'"nextp"': [CurrColor, CurrDif],
		'"board"': NewBoard,
        '"cels"' : NewCels,
		'"nGreen"': NewNGreen,
		'"nYellow"': NewNYellow,
		'"nTurns"': NTurns2,
		'"performed_move"': [X1, Y1]
	}.

% Move does not result in game over
parse_input(insert/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[X1, Y1], Res) :-
	% Only an human player can attempt to move
	is_human(CurrDif),

    GS = game_state(Board, Cels, NGreen, NYellow),
	Mov = move(X1, Y1),

	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut), !,

	NTurns2 is NTurns + 1,

	Res = {
		'"success"': true,

		'"game_over"': false,

		'"currp"': [NextColor, NextDif],
		'"nextp"': [CurrColor, CurrDif],
		'"board"': NewBoard,
        '"cels"' : NewCels,
		'"nGreen"': NewNGreen,
		'"nYellow"': NewNYellow,
		'"nTurns"': NTurns2,
		'"performed_move"': [X1, Y1]
	}.

% Probably invalid move only, but test it more thoroughly later
parse_input(insert/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1], Res) :- 
	Res = {
		'"success"': false,
		'"reason"': '"Death by indetermination"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"': Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
		'"nTurns"': NTurns
	}.

%%%%%%%%%%%%%%%%%%%%% /move

% Passed game is already over
parse_input(move/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1, _X2, _Y2], Res) :-
    (
        game_over(Board, CurrColor), Winner = CurrColor, !;
        game_over(Board, NextColor), Winner = NextColor, !
    ),

	Res = {
		'"success"': false,
		'"reason"': '"Game already over"',
		'"game_over"': true,
		'"winner"': Winner,

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"' : Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
        '"nTurns"': NTurns
	}.

% Checking if the current player can even move any pieces at all
parse_input(move/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1, _X2, _Y2], Res) :- 
	\+ is_human(CurrDif), !,

	Res = {
		'"success"': false,
		'"reason"': '"Current player is not human"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"' : Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
        '"nTurns"': NTurns
	}.

% Check for gameover after moving -> Move results in game over
parse_input(move/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[X1, Y1, X2, Y2], Res) :-
	% Only an human player can attempt to move
	is_human(CurrDif),

	GS = game_state(Board, Cels, NGreen, NYellow),
	Mov = move(X1, Y1, X2, Y2),

	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut),
	(
        game_over(NewBoard, CurrColor), Winner = CurrColor, !;
        game_over(NewBoard, NextColor), Winner = NextColor, !
    ),

	NTurns2 is NTurns + 1,

	Res = {
		'"success"': true,

		'"game_over"': true,
		'"winner"': Winner,

		'"currp"': [NextColor, NextDif],
		'"nextp"': [CurrColor, CurrDif],
		'"board"': NewBoard,
        '"cels"' : NewCels,
		'"nGreen"': NewNGreen,
		'"nYellow"': NewNYellow,
		'"nTurns"': NTurns2,
		'"performed_move"': [X1, Y1, X2, Y2]
	}.

% Move does not result in game over
parse_input(move/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[X1, Y1, X2, Y2], Res) :-
	% Only an human player can attempt to move
	is_human(CurrDif),

    GS = game_state(Board, Cels, NGreen, NYellow),
	Mov = move(X1, Y1, X2, Y2),

	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut), !,

	NTurns2 is NTurns + 1,

	Res = {
		'"success"': true,

		'"game_over"': false,

		'"currp"': [NextColor, NextDif],
		'"nextp"': [CurrColor, CurrDif],
		'"board"': NewBoard,
        '"cels"' : NewCels,
		'"nGreen"': NewNGreen,
		'"nYellow"': NewNYellow,
		'"nTurns"': NTurns2,
		'"performed_move"': [X1, Y1, X2, Y2]
	}.

% Probably invalid move only, but test it more thoroughly later
parse_input(move/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif]/[_X1, _Y1, _X2, _Y2], Res) :- 
	Res = {
		'"success"': false,
		'"reason"': '"Death by indetermination"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"': Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
		'"nTurns"': NTurns
	}.

%%%%%%%%%%%%%%%%%%%%% /calcmove

% Game already over
parse_input(calcmove/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif], Res) :-
	(
        game_over(NewBoard, CurrColor), Winner = CurrColor, !;
        game_over(NewBoard, NextColor), Winner = NextColor, !
    ),


	Res = {
		'"success"': false,
		'"reason"': '"Game already over"',
		'"game_over"': true,
		'"winner"': Winner,

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"': Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
		'"nTurns"': NTurns
	}.

% Not an AI player
parse_input(calcmove/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif], Res) :-
	is_human(CurrDif), !,

	Res = {
		'"success"': false,
		'"reason"': '"Current player is not an AI"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"': Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
		'"nTurns"': NTurns
	}.

% Check for gameover after moving -> Move results in game over
parse_input(calcmove/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif], Res) :-
	% Sanity check
	\+ is_human(CurrDif),

	GS = game_state(Board, Cels, NGreen, NYellow),

	choose_move(CurrDif, GS, Mov, CurrColor, NextColor, NTurns),
	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut),
	(
        game_over(NewBoard, CurrColor), Winner = CurrColor, !;
        game_over(NewBoard, NextColor), Winner = NextColor, !
    ),

	NTurns2 is NTurns + 1,

    (
        Mov = move(X1, Y1, X2, Y2),
        Res = {
            '"success"': true,

            '"game_over"': true,
            '"winner"': Winner,

            '"currp"': [NextColor, NextDif],
            '"nextp"': [CurrColor, CurrDif],
            '"board"': NewBoard,
            '"cels"' : NewCels,
            '"nGreen"': NewNGreen,
            '"nYellow"': NewNYellow,
            '"nTurns"': NTurns2,
            '"performed_move"': [X1, Y1, X2, Y2]
        };
        Mov = move(X1, Y1),
        Res = {
            '"success"': true,

            '"game_over"': true,
            '"winner"': Winner,

            '"currp"': [NextColor, NextDif],
            '"nextp"': [CurrColor, CurrDif],
            '"board"': NewBoard,
            '"cels"' : NewCels,
            '"nGreen"': NewNGreen,
            '"nYellow"': NewNYellow,
            '"nTurns"': NTurns2,
            '"performed_move"': [X1, Y1]
        }
    ).

% Move that does not result in a game over
parse_input(calcmove/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif], Res) :-
	% Sanity check
	\+ is_human(CurrDif),

	GS = game_state(Board, Cels, NGreen, NYellow),

	choose_move(CurrDif, GS, Mov, CurrColor, NextColor, NTurns),
	move(GS, CurrColor, Mov, BoardOut),
    nextTurn(GS, game_state(NewBoard, NewCels, NewNGreen, NewNYellow), BoardOut), !,

	NTurns2 is NTurns + 1,

	(
        Mov = move(X1, Y1, X2, Y2),
        Res = {
            '"success"': true,

            '"game_over"': true,
            '"winner"': Winner,

            '"currp"': [NextColor, NextDif],
            '"nextp"': [CurrColor, CurrDif],
            '"board"': NewBoard,
            '"cels"' : NewCels,
            '"nGreen"': NewNGreen,
            '"nYellow"': NewNYellow,
            '"nTurns"': NTurns2,
            '"performed_move"': [X1, Y1, X2, Y2]
        };
        Mov = move(X1, Y1),
        Res = {
            '"success"': true,

            '"game_over"': true,
            '"winner"': Winner,

            '"currp"': [NextColor, NextDif],
            '"nextp"': [CurrColor, CurrDif],
            '"board"': NewBoard,
            '"cels"' : NewCels,
            '"nGreen"': NewNGreen,
            '"nYellow"': NewNYellow,
            '"nTurns"': NTurns2,
            '"performed_move"': [X1, Y1]
        }
    ).

% Not sure what can trigger this, but throwing an error correctly nonetheless
parse_input(calcmove/[Board, Cels, NGreen, NYellow, NTurns]/[CurrColor, CurrDif]/[NextColor, NextDif], Res) :-
	Res = {
		'"success"': false,
		'"reason"': '"Call the terminator, AI takeover!!"',

		'"currp"': [CurrColor, CurrDif],
		'"nextp"': [NextColor, NextDif],
		'"board"': Board,
        '"cels"': Cels,
		'"nGreen"': NGreen,
		'"nYellow"': NYellow,
		'"nTurns"': NTurns
	}.