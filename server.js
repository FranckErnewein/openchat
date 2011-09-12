var http = require('http'); 
var url = require('url');
var fs = require('fs');
var sys = require('sys');
var url = require('url');
var path = require('path');

var querystring = require('querystring');
var io = require('./socket.io/');


work = require("./work/FileServer.js");

var server = http.createServer(function(req, res){

	var uri = url.parse(req.url).pathname;  
	var filename = path.join(process.cwd(), uri);  
	
console.log(uri);

	if(uri == '/log/'){
			

			var body = '';
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin' : '*',
				'Access-Control-Allow-Methods' : 'POST',
				'Access-Control-Allow-Credentials' :  false,
				'Access-Control-Max-Age' : '86400',
				'Access-Control-Allow-Headers' : 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
			});
			req.addListener('data', function (dataPost) {

				body += dataPost;
				
			}).addListener('end', function () {
				console.log(body);
				try{
					var POST = JSON.parse(body);
					io.broadcast({log:POST});
					res.write('ok');  
					//sys.puts("This is the post: " + sys.inspect(POST));
				}catch(e){
					res.write('error');  
					res.write(body);  
					console.log(e);
					io.broadcast({log:'server error'});	
					io.broadcast({log:e});
				}
				//res.writeHead("Access-Control-Allow-Origin", "*");
				//res.writeHead(200);  
				res.end();  
				return;  
			});

	}else{

		path.exists(filename, function(exists){  
			if(!exists){  
				res.writeHead(404);  
				res.write('Error 404');  
				res.end();  
				return;  
			}  

			fs.readFile(filename, 'binary', function(err, file) {  
				if(err){  
					res.writeHead(500, {'Content-Type': 'text/plain'});  
					res.write(err + '\n');  
					res.end();  
					return;  
				}  

				res.writeHead(200);  
				res.write(file, 'binary');  
				res.end();  
			});
		});
	}

});

server.listen(8080 ,{
	transportOptions:{
		'xhr-polling':{
			closeTimeout: 1000 * 60 * 5
		}
	}
});


var io = io.listen(server);


var users = {};

io.on('connection', function(client){


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
