$(document).ready(function(){
	var connect_form = $('#connect');
	var is_logged = false;
	var users_list = $('#users ul');
	var users = $('#users');
	var log = $('#log');

	$('#allowNotif').click(function(){
		webkitNotifications.requestPermission(function() {
			$('#allowNotif').hide();
		});
	});
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
	var ws = new io.Socket(null, {port:8080, rememberTransport:false});
	ws.on('connect', function(){
		//console.log('connect')
	})
	ws.on('disconnect', function(obj){
		//console.log('logout')
		//console.log(connect_form);
		connect_form.fadeIn();
		is_logged = false;
	});
	ws.on('message', function(obj){
		if(obj.logged == true){
			is_logged = true;
			$('#layer').fadeOut();
		}
		
		if(obj.mess && is_logged){

			//console.log(obj)
			var li = $(document.createElement('li'));
			var mess = $(document.createElement('p'));
			mess.text(obj.mess);
			var content = mess.html().replace(exp, '<a href="$1" target="_blank" >$1</a>');
			mess.html(content)
			mess.appendTo(li);
				
			var who = $(document.createElement('em'));
			who.addClass('intro');
			var time = new Date();
			var minutes = time.getMinutes();
			if(minutes < 10) minutes = "0"+minutes
			who.text(obj.name + ' - ' +time.getHours() + ':' + minutes);
			who.prependTo(li);
			li.hide();
			li.appendTo(log).slideDown();


			if(obj.name != 'You'){

				if($('#sound').is(':checked')){
					var sound = new Audio('http://soundbible.com/grab.php?id=1424&type=mp3');
					sound.volume = 0.5;
					sound.play();
				}

				if($('#notif').is(':checked')){
					var notification = webkitNotifications.createNotification(
					  'http://masslol.com:8080/favicon.png',
					  obj.name,  // notification title
					  obj.mess  // notification body te
					);
					notification.show();
					setTimeout(function(){
						notification.cancel();
					}, 5000)
				}	

			}else{

				webkitNotifications.requestPermission(function(){
					$('#allowNotif').hide();
				});
			}
		}

		if(obj.users && is_logged){
			users_list.empty();
			for(var i in obj.users){
				var li = $(document.createElement('li'));
				li.text(obj.users[i].name);
				users_list.append(li);
			}
		}

		if(obj.log){
			console.log(obj.log);
			if(obj.log.stack){
				console.log(obj.log.stack);
			}
		}


		
	});


	var name = $('#nick_name');
	var input = $('#new_message');

	$('#speaker').submit(function(e){
		ws.send({
			mess:input.val()
		});
		input.val('');
		return false;
	});
	$('#logout').click(function(){
		ws.disconnect();
		return false;
	});
	input.focus();
	
	connect_form.submit(function(){
		ws.connect();
		ws.send({
			name:$('#name').val()
		});
		return false;
	});
});


