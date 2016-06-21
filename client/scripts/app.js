// ----------------------- GLOBAL VARIABLES ----------------------------

var message = {
  username: 'no one',
  text: 'I"m hack proof now!',  
  roomname: '4chan'
};

// ------------------ XSS PREVENTION - TAG REMOVERS ----------------------
var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

function removeTags(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  html.replace(/script/, '');
  return html.replace(/</g, '&lt;');
}

$(document).ready(function () {

	// ----------------- ALMOST GLOBAL VARIABLES -------------------------

	var newestID;
	var dataArray = [];
	var friendsList = {};
	var roomsList = {};

	// ------------------------ INITIALIZATION --------------------------
	message.username = prompt("Please enter your username");

	console.log(message.username);

	var $GET = {
		url: 'https://api.parse.com/1/classes/messages',
		type: 'GET',
		data: JSON.stringify(message),
		contentType: 'application/json',
		success: function (data) {
			console.log('chatterbox: Message received');
		/* Format of data: 
		Object { results: Array with 100 indexes }
		Each array [has an object {
		username: 'string',
		text: 'string',
		roomname: 'string'
		}]
		*/
			dataArray = data.results;
			dataArray.forEach(function printToScreen (item, index) {
				if (item.text) {
					if (index === 0) {
						newestID = item.objectId;
					}
					var $myPost = $('<div class="posts"></div>');
					$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
					$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
					$('#chats').append($myPost);
					if (item.roomname && !roomsList[item.roomname]) {
						var myRoom = item.roomname
						roomsList[myRoom] = true;
						$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
					}
				}
			});
		},
		error: function (data) {
			console.error('chatterbox: Failed to receive message', data);
		}
	};

	$.ajax($GET);

	var basicUpdate = {};
	for (var key in $GET) {
		basicUpdate[key] = $GET[key];
	}
	$GET.success = function(data) {
		dataArray = data.results;
		// console.log(dataArray[0].text);
		for (var x = 0, found = false; x < dataArray.length && !found; x++) {

			if (dataArray[x].text) {
				if (dataArray[x].objectId !== newestID) {
					var $myPost = $('<div class="posts"></div>');
					$myPost.append('<p class="username">' + removeTags(dataArray[x].username ? dataArray[x].username : 'Anonymous') + '</p>');
					$myPost.append('<p class="messages">' + removeTags(dataArray[x].text) + '</p>');
					if (dataArray[x].username && friendsList[dataArray[x].username]) {
						$myPost.addClass('friend');
					}
					$('#chats').prepend($myPost);
					$('.posts').last().remove();
					if (dataArray[x].roomname && !roomsList[dataArray[x].roomname]) {
						var myRoom = dataArray[x].roomname
						roomsList[myRoom] = true;
						$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
					}
				} else {
					found = true;
				}
			}

		}
		newestID = dataArray.objectId;
		console.log('chatterbox: Message received');
	}

	// ------------------- CONTINUOUS UPDATE LOOP ----------------------------

	setInterval(function displayPosts () {
		$.ajax($GET);
	}, 5000);

	$('#chats').on('click', '.username', function () {
		var friendName = $(this).text();
		if (!friendsList[friendName]) {
			if (friendName !== 'Anonymous') {
				friendsList[friendName] = true;
			}
			$('.friendsMenu').append('<option value="' + friendName + '">' + friendName + '</option>');
		}
	});

	// ------------------- FILTER FOR FRIENDS --------------------------------

	$('.friendsMenu').change(function filterFriends() {

		var someusername = $(this).val();

		if (someusername === 'AllFriends') {
			for (var key in basicUpdate) {
				$GET[key] = basicUpdate[key];
			}
			$('#chats').empty();
			dataArray.forEach(function checkName(item){
				var $myPost = $('<div class="posts"></div>');
				$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
				$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
				if (item.username && friendsList[item.username]) {
					$myPost.addClass('friend');
				}
				$('#chats').append($myPost);
			});
		} else {

			$GET.success = function(data) {
				newestID = dataArray[0].objectId;
				dataArray = data.results.filter(function filterForFriend(item){
					return item.username === someusername;
				});
				// console.log(dataArray[0].text);
				for (var x = 0, found = false; x < dataArray.length && !found; x++) {

					if (dataArray[x].text) {
						if (dataArray[x].objectId !== newestID) {
							var $myPost = $('<div class="posts"></div>');
							$myPost.append('<p class="username">' + removeTags(dataArray[x].username ? dataArray[x].username : 'Anonymous') + '</p>');
							$myPost.append('<p class="messages">' + removeTags(dataArray[x].text) + '</p>');
							if (dataArray[x].username && friendsList[dataArray[x].username]) {
								$myPost.addClass('friend');
							}
							$('#chats').prepend($myPost);
							$('.posts').last().remove();
							if (dataArray[x].roomname && !roomsList[dataArray[x].roomname]) {
								var myRoom = dataArray[x].roomname
								roomsList[myRoom] = true;
								$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
							}
						} else {
							found = true;
						}
					}

				}
				newestID = dataArray[0].objectId;
				console.log('chatterbox: Message received');
			}

			$('#chats').empty();
			dataArray.forEach(function checkName(item){
				if (item.username && item.username === someusername) {
					var $myPost = $('<div class="posts friend"></div>');
					$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
					$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
					$('#chats').append($myPost);
				}
			});
		}
	});

	// ------------------------ FILTER FOR ROOMS ------------------------

	$('.chatRooms').change(function filterRooms() {

		var someroomname = $(this).val();

		if (someroomname === 'AllRooms') {
			message.roomname = '';
			for (var key in basicUpdate) {
				$GET[key] = basicUpdate[key];
			}
			$('#chats').empty();
			dataArray.forEach(function checkName(item){
				var $myPost = $('<div class="posts"></div>');
				$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
				$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
				if (item.username && friendsList[item.username]) {
					$myPost.addClass('friend');
				}
				$('#chats').append($myPost);
			});
		} else {
			message.roomname = someroomname;
			$GET.success = function(data) {
				newestID = dataArray[0].objectId;
				dataArray = data.results.filter(function filterForRoom(item){
					return item.roomname === someroomname;
				});
				// console.log(dataArray[0].text);
				for (var x = 0, found = false; x < dataArray.length && !found; x++) {

					if (dataArray[x].text) {
						if (dataArray[x].objectId !== newestID) {
							var $myPost = $('<div class="posts"></div>');
							$myPost.append('<p class="username">' + removeTags(dataArray[x].username ? dataArray[x].username : 'Anonymous') + '</p>');
							$myPost.append('<p class="messages">' + removeTags(dataArray[x].text) + '</p>');
							if (dataArray[x].username && friendsList[dataArray[x].username]) {
								$myPost.addClass('friend');
							}
							$('#chats').prepend($myPost);
							$('.posts').last().remove();
						} else {
							found = true;
						}
					}

				}
				newestID = dataArray[0].objectId;
				console.log('chatterbox: Message received');
			}

			$('#chats').empty();
			dataArray.forEach(function checkName(item){
				if (item.roomname && item.roomname === someroomname) {
					var $myPost = $('<div class="posts friend"></div>');
					$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
					$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
					$('#chats').append($myPost);
				}
			});
		}
	});

	$('#submitButton').on('click', function submitPost(){
		message.text = $('#postmessage').val();
		$.ajax({
		  // This is the url you should use to communicate with the parse API server.
		  url: 'https://api.parse.com/1/classes/messages',
		  type: 'POST',
		  data: JSON.stringify(message),
		  contentType: 'application/json',
		  success: function (data) {
		    console.log('chatterbox: Message sent');
		  },
		  error: function (data) {
		    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
		    console.error('chatterbox: Failed to send message', data);
		  }
		});
		$('#postmessage').val('');
	});

	$('#createRoom').on('click', function createRoom() {
		var myRoom = $('#createrooms').val();
		roomsList[myRoom] = true;
		message.text = message.username + 'created a room named ' + myRoom + '!';
		message.roomname = myRoom;
		$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
		$.ajax({
		  // This is the url you should use to communicate with the parse API server.
		  url: 'https://api.parse.com/1/classes/messages',
		  type: 'POST',
		  data: JSON.stringify(message),
		  contentType: 'application/json',
		  success: function (data) {
		    console.log('chatterbox: Message sent');
		  },
		  error: function (data) {
		    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
		    console.error('chatterbox: Failed to send message', data);
		  }
		});
		$('#createrooms').val('');
	});


});










