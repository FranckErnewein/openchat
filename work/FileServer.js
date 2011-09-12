var http = require('http'); 
var url = require('url');
var fs = require('fs');
var sys = require('sys');
var url = require('url');
var path = require('path');



var FileServer = function(_port){
	
	var port = _port || 8080;

	var server = http.createServer(function(req, res){

		var uri = url.parse(req.url).pathname;  
		var filename = path.join(process.cwd(), uri);  


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
	});

	server.listen(port ,{
		transportOptions:{
			'xhr-polling':{
				closeTimeout: 1000 * 60 * 5
			}
		}
	});
	
	return server;
}

exports.FileServer = FileServer;
