/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require('underscore');

var database = [];

var requestHandler = function(request, response) {

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  var myRequest = request;

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  

  // The outgoing status.
  var statusCode = 200;
  var query;
  var queryObject = {};  
  if (request.url !== '/classes/messages') {
    
    if (request.method === 'OPTIONS' || request.method === 'GET') {
      if (request.url.slice(0, request.url.indexOf('?')) === '/classes/messages') {
        statusCode = 200;
        query = request.url.slice(request.url.indexOf('?') + 1);
        query = query.split('?');
        query = query.map(function(ar) {
          return ar.split('=');
        });
        query.forEach(function(ar) {
          queryObject[ar[0]] = ar[1]; 
        });
      } else {
        statusCode = 404;
      }
    } else { 
      statusCode = 404;
    }
  }

  if (request.method === 'POST' && statusCode !== 404 ) {
    
    statusCode = 201;

    var data = '';
    request.addListener('data', (chunk) => {
      data += chunk;
    });
    request.addListener('end', () => {

      try {
        data = JSON.parse(data);
        var message = data;
        message.text = message.message;
      } catch (err) {
        console.log('Data was not JSON parseable string');
        // note! escape and parse
        data = _.escape(data);
        data = decodeURIComponent(data);
        
        data = data.split('+').join(' ');

        data = data.split('&amp;');
        var message = {};
        
        data.forEach(function(ar) {
          var tempMessage = ar.split('=');
          message[tempMessage[0]] = tempMessage[1];

        });
        message.text = _.unescape(message.text);
        message.message = message.text;

      }
      message.objectId = message.createdAt = new Date();
      
      database.push(message);    
    // at this point, `body` has the entire request body stored in it as a string
    });  

  }

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  
  


  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the cliend t until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  var resultsArray = _.clone(database);
  
  if ('order' in queryObject) {
    
    if (queryObject['order'][0] === '-') {
      
      resultsArray.sort(function(a, b) {
        return a.createdAt < b.createdAt;
      });
    } 
  } 

  response.end(JSON.stringify({results: resultsArray})); 
  
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key', 
  'access-control-max-age': 10 // Seconds.
  
};

module.exports.requestHandler = requestHandler;
