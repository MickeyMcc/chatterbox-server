/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
const decodeUriComponent = require('decode-uri-component');

var url = require('url');
var fs = require('fs');
var output = {results: []};
var nextId = 1;
var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';

  var statusCode;

  var urlArray = parseRequest(request.url);
  
  if (request.method === 'OPTIONS') {
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  } else if (urlArray[0] === '/classes/messages') {

    if (request.method === 'GET') {
      if (output.results.length === 0) {
        statusCode = 200;
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify({results: [{username: 'domain', messages: 'no messages yet', objectId: 0}]}));
      }

      if (urlArray[1] === 'order=-createdAt') {
        statusCode = 200;
        response.writeHead(statusCode, headers);  
        var reversed = output.results.slice().reverse();
        var returnValue = {'results': reversed};
        response.end(JSON.stringify(returnValue));
      } else {
        statusCode = 200;
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(output));
      }

      
    } else if (request.method === 'POST') {
      var inbound = [];
      
      request.on('data', function(data) {
        inbound.push(data);
      });
      
      request.on('end', function() {
        var parsed = JSON.parse(`"${inbound}"`);
        parsed = encodeURI(inbound);
        parsed = decodeUriComponent(parsed);
        console.log(parsed);
        var messagePieces = parsed.split('&');
        var message = {};
        for (var piece of messagePieces) {
          tuple = piece.split('=');
          message[tuple[0]] = tuple[1];
        }
        message['objectId'] = nextId;

        nextId++; 

        output.results.push(message);
      
        statusCode = 201;
        console.log('OUTPUT:', output);
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(output));
      });
      
    } 
  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }
};

var parseRequest = function(requestUrl) {
  var urlArray = requestUrl.split('?');
  return urlArray;
};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

exports.requestHandler = requestHandler;
