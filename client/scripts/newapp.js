// -------------------- GLOBAL VARIABLES ---------------------

var message = {
	username: 'no one',
	text: '',
	roomname: 'All Rooms'
}

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

// ----------------- MAIN OBJECT TO STORE FUNCTIONS -----------

var app = {
	newestID: false,
	dataArray: [],
	friendsList: {},
	roomsList: {},

	$POST: {
		  url: 'https://api.parse.com/1/classes/messages',
		  type: 'POST',
		  data: JSON.stringify(message),
		  contentType: 'application/json',
		  success: function (data) {
		    console.log('chatterbox: Message sent');
		  },
		  error: function (data) {
		    console.error('chatterbox: Failed to send message', data);
		  }
	},

	$GET: {
		url: 'https://api.parse.com/1/classes/messages',
		type: 'GET',
		data: JSON.stringify(message),
		contentType: 'application/json',
		success: function (data) {
			console.log('chatterbox: Message received');
			app.dataArray = data.results;
			app.dataArray.forEach(function printToScreen (item, index) {
				if (item.text) {
					if (index === 0) {
						newestID = item.objectId;
					}
					var $myPost = $('<div class="posts"></div>');
					$myPost.append('<p class="username">' + removeTags(item.username ? item.username : 'Anonymous') + '</p>');
					$myPost.append('<p class="messages">' + removeTags(item.text) + '</p>');
					$('#chats').append($myPost);
					if (item.roomname && !app.roomsList[item.roomname]) {
						var myRoom = item.roomname
						app.roomsList[myRoom] = true;
						$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
					}
				}
			});
		},
		error: function (data) {
			console.error('chatterbox: Failed to receive message', data);
		}
	}, 

	$GEToptions: {
		filterFriends: false,
		filterByName: undefined,
		filterRooms: false,
		filterByRoom: undefined,
	},

	init: function() {
		$.ajax(app.$GET);
		app.$GET.success = function(data) {
			
			app.newestID = app.dataArray[0].objectId;
			app.dataArray = data.Results;

			if (app.$GEToptions.filterFriends) {
				app.dataArray.filter(function filterByFriend(item) {
					return item.username === app.$GEToptions.filterByName;
				});
			} 
			if (app.$GEToptions.filterRooms) {
				app.dataArray.filter(function filterByRooms(item) {
					return item.roomname === app.$GEToptions.filterByRoom;
				});
			}

			for (var x = 0, found = false; x < app.dataArray.length && !found; x++) {
				if (app.dataArray[x].text) {
					if (app.dataArray[x].objectId !== newestID) {
						var $myPost = $('<div class="posts"></div>');
						$myPost.append('<p class="username">' + removeTags(app.dataArray[x].username ? app.dataArray[x].username : 'Anonymous') + '</p>');
						$myPost.append('<p class="messages">' + removeTags(app.dataArray[x].text) + '</p>');
						if (app.dataArray[x].username && app.friendsList[app.dataArray[x].username]) {
							$myPost.addClass('friend');
						}
						$('#chats').prepend($myPost);
						$('.posts').last().remove();
						if (app.dataArray[x].roomname && !app.roomsList[app.dataArray[x].roomname]) {
							var myRoom = app.dataArray[x].roomname
							app.roomsList[myRoom] = true;
							$('.chatRooms').append('<option value="' + myRoom + '">' + myRoom + '</option>');
						}
					} else {
						found = true;
					}
				}

			}
			app.newestID = app.dataArray[0].objectId;
			console.log('chatterbox: Message received');
		}
	}

	addFriend: function(friendName) {
		if (friendName !== 'Anonymous' && !app.friendsList[friendName]) {
			app.friendsList[friendName] = true;
		}
	},

	addRoom: function(roomName) {
		if (!app.roomsList[roomName]) {
			app.roomsList[roomName] = true;
			message.text = message.username + 'created a room named ' + roomName + '!';
			message.roomname = roomName;
			$('.chatRooms').append('<option value="' + roomName + '">' + roomName + '</option>');
			$.ajax($POST);
		}
	},

	send: function(myMessage) {
		message.text = myMessage;
		$.ajax($POST);
	},

	fetch: function() {
		$.ajax($GET);
	},
};

$(document).ready(function() {

	message.username = prompt("Please enter your username");

	app.init();

});