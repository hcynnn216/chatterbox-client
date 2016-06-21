// YOUR CODE HERE:

$(document).ready(function () {

	var newestID;
	var dataArray = [];
	var $GET = {
		url: 'https://api.parse.com/1/classes/messages',
		type: 'GET',
		data: JSON.stringify(message),
		contentType: 'application/json',
		success: function (data) {
			console.log(data);
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
					$('#chats').append('<p>' + removeTags(item.text) + '</p>');
				}
			});
		},
		error: function (data) {
			console.error('chatterbox: Failed to receive message', data);
		}
	};

	$.ajax($GET);

	setInterval(function displayPosts () {
		var somevariable = $GET;
		$GET.success = function(data) {
			dataArray = data.results;
			console.log(dataArray[0].text);
			for (var x = 0, found = false; x < dataArray.length && !found; x++) {

				if (dataArray[x].text) {
					if (dataArray[x].objectId !== newestID) {
						$('.posts').prepend('<p class="posts">' + removeTags(dataArray[x].text) + '</p>');
						$('.posts').last().remove();
					} else {
						found = true;
					}
				}

			}
			newestID = dataArray.objectId;
			console.log('chatterbox: Message received');
		}
		$.ajax($GET);
	}, 5000);

});





// Example from Bookstrap: 
var message = {
  username: 'no one',
  text: 'I"m hack proof now!',  
  roomname: '4chan'
};

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

$.ajax({
  url: 'https://api.parse.com/1/classes/messages',
  type: 'GET',
  data: JSON.stringify(message),
  contentType: 'application/json',
  success: function (data) {
  	console.log(data);
    console.log('chatterbox: Message received');
    /* Format of data: 
    Object { results: Array with 100 indexes }
    Each array [has an object {
		username: 'string',
		text: 'string',
		roomname: 'string'
    }]
    */
    data.results.forEach(function printToScreen (item) {
      if (item.text) {
        $('#chats').append('<p>' + removeTags(item.text) + '</p>');
      }
    });
  },
  error: function (data) {
    console.error('chatterbox: Failed to receive message', data);
  }
});

// Set of functions to remove tags from input
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

var $myHtml = '<p>Hello""<script>""<script>console.log("Do evil things");</script></p>';

console.log(removeTags($myHtml));


