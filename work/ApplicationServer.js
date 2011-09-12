var io = require('../socket.io/');

var work = require("./FileServer.js");
var utils = require("./Utils.js");

var ApplicationServer = function(){
	this.server = work.FileServer();
	this.io = io.listen(this.server);
	this.__callback = [];
	var self = this;
	
	this.io.on('connection', function(client){
		client.on('message', function(event){
			if(event.type && self.__callback[event.type]){
				event.client = client;
				try{
					for(var i in self.__callback[event.type]){
						var appEvent = new ServerEvent(event.type, client)
						appEvent.set(event.data);
						self.__callback[event.type][i](appEvent);
					}
				}catch(exp){
					var exceptionEvent = new ServerEvent(event.type, client);
					exceptionEvent.error = {code:1, message:exp}
					console.log(exp)
					exceptionEvent.respond();	
				}
			}else{
				console.log('bad event.type');
				console.log(event);
			}
		});
		if(typeof self.onClose == 'function'){
			client.on('disconnect', function(c){
				console.log('close  !!')
				self.onClose(client);
			});
		}
				
	});
}

ApplicationServer.prototype.on = function(eventType, callback){
	if(typeof eventType != 'string')
		throw 'eventType is not a String, it is a '+(typeof eventType);
	if(!this.__callback[eventType])	
		this.__callback[eventType] = [];
	if(typeof callback == 'function')
		this.__callback[eventType].push(callback);
}



var ServerEvent = function(type, client){
	this.checked = false;
	this.type = type;
	this.client = client;
	this.data = {};
}

ServerEvent.prototype.export = function(){
	var export = {type:this.type, data:this.data};
	if(this.error) export.error = this.error;
	return export;
}
ServerEvent.prototype.set = function(data){
	var newData = {};
	console.log(data);
	console.log(this.data);
	newData = utils.merge(this.data, data);
	console.log( newData);
	this.data = newData; 
}

ServerEvent.prototype.dispatch = function(){
	this.client.broadcast(this.export());
}

ServerEvent.prototype.respond = function(){
	this.client.send(this.export());
}


exports.ApplicationServer = ApplicationServer;
exports.ServerEvent = ServerEvent;

