// YOUR CODE HERE:

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


