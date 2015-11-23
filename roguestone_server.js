var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 8080;

var game_player_list = {};
var online_player_list = [];

io.on('connection', function(client) {
	client.on('game_init', function(game_data) {
		game_player_list[game_data[1]] = [];
		game_player_list[game_data[1]].push(game_data[0]);		
		client.broadcast.emit('update_game_list', game_player_list);
	});
	client.on('join_lobby', function (username) {
		console.log(username + " joined.");
		online_player_list.push(username);
		client.emit('update_game_list', game_player_list);
	});
	client.on('join_game', function (join_data) {
		game_player_list[join_data[1]].push(join_data[0]);
		client.broadcast.emit('update_game_list', game_player_list);
		client.emit('update_game_list', game_player_list);
	})
});


server.listen(port);