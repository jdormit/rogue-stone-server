var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var extend = require('node.extend');

var port = process.env.PORT || 8080;

var game_player_list = {};
var online_player_list = {usernames : []};
var entities_by_game = {};
var game_meta_data = {};
var entity_chars = {};
var game_color_map = {};

io.on('connection', function(client) {
	client.on('game_init', function(game_data) {
		game_player_list[game_data[1]] = [];
		game_player_list[game_data[1]].push(game_data[0]);
		entities_by_game[game_data[1]] = {}; //this stores the entities for the game given by game_data[1]
		entity_chars[game_data[1]] = {}; //this stores the character entities for each game
		game_color_map[game_data[1]] = {}; //this stores entity colors
		client.broadcast.emit('update_game_list', game_player_list);
	});
	client.on('host_setup', function (data) {
		console.log('setting up host: seed for ' + data[1] + ' is ' + data[0]);
		game_meta_data[data[1]] = {};
		game_meta_data[data[1]].seed = data[0];
	});
	client.on('join_lobby', function (username) {
		console.log(username + " joined.");
		online_player_list.usernames.push(username);
		client.emit('update_game_list', game_player_list);
	});
	client.on('join_game', function (join_data) {
		game_player_list[join_data[1]].push(join_data[0]);
		client.broadcast.emit('update_game_list', game_player_list);
	});
	client.on('join_game_request', function (game_id) {
		client.emit('join_game', game_meta_data);
		var data = {data:[entities_by_game, entity_chars, game_id, game_color_map]};
		client.broadcast.emit('update_client_entities', data);
		client.emit('update_entities_on_join', data);
	});
	client.on('update_server_entities', function (entity_data) { //[0] is entities, [1] is entity_chars, [2] is game_id, [3] is color_map
		entities_by_game[entity_data[2]] = {}; //entity_data will contain all entities, so clear out existing ones
		entity_chars[entity_data[2]] = {};
		game_color_map[entity_data[2]] = {};
		game_color_map[entity_data[2]] = extend({}, entity_data[3]);
		entities_by_game[entity_data[2]] = extend({}, entity_data[0]);
		entity_chars[entity_data[2]] = extend({}, entity_data[1]);
		var data = {data:[entities_by_game, entity_chars, entity_data[2], game_color_map]};
		client.emit('update_client_entities', data);
		client.broadcast.emit('update_client_entities', data);
	});
});


server.listen(port);