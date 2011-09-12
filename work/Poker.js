var io = require('./socket.io/');
work = require("./work/FileServer.js");


var Cards = [];

var Player = function(client){
	this.client = client;
}

var pocker = {
	event:{
	}
}


var Game = function(){
this.players = [];
}

Game.addPlayer function(client){
	this.players.push(client);
	var index = this.player.length-1;
	client.on(''
};

var game = new Game();

var server = work.FileServer();
var observer = io.listen(server);

observer.on('connection', function(client){
	client.send('Welcome');
	game.addPlayer(client);
	client.on('message', function(obj){
		if(obj && obj.type)
			client.emit(obj.type, obj.data);
	});
});



