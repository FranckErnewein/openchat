var express = require('express'),
	socketio = require('socket.io');

console.log( 'test modid branch demo');

var app = express.createServer();
var io = socketio.listen(app);


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/www/websocket.html');
});
app.use( express.static(__dirname + '/www'));

app.listen( process.env.PORT || process.env.VCAP_APP_PORT ||  1337 );


var users = {};

io.sockets.on('connection', function(client){


	client.on('message', function(obj){
		if(obj.name && typeof obj.name =='string' && obj.name != ''){
			users[client.sessionId] = {
				name:null
			}	
			users[client.sessionId].name = obj.name;
			client.broadcast({
				users:users
			});
			client.send({
				users:users,
				logged:true
			});
			console.log(users[client.sessionId].name+' : '+ client.request.client.remoteAddress);
		}	
		if(obj.mess && users[client.sessionId]){
			var name = (users[client.sessionId]) ? users[client.sessionId].name : 'Unknow';
			if(name != 'suceuse'){
				client.broadcast({
					name:name,
					mess:obj.mess
				});
			}
			client.send({
				name:'You',
				mess:obj.mess
			});
		}

	});

	client.on('disconnect', function(){
		delete users[client.sessionId];
		client.broadcast({users:users});
	});
});
