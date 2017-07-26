var request = require('request');
var expect = require('chai').expect;

describe('server', function() {
  it('should respond to GET requests for /classes/messages with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      done();
    });
  });

  it('should send back an object', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  it('should send an object containing a `results` array', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      expect(parsedBody.results).to.be.an('array');
      done();
    });
  });

  it('should accept POST requests to /classes/messages', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
     
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('should respond with messages that were previously posted', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messages = JSON.parse(body).results;
        expect(messages[0].username).to.equal('Jono');
        expect(messages[0].message).to.equal('Do my bidding!');
        done();
      });
    });
  });

  it('Should 404 when asked for a nonexistent endpoint', function(done) {
    request('http://127.0.0.1:3000/arglebargle', function(error, response, body) {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  //make sure the message is not modified such as space replaced with +
  it('Should not modify the original message from client', function(done) {
    
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do <my/> bidding!'}
    };

    var requestMessage = requestParams.json;
    request(requestParams, function( error, response, body) {

      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      //expect(response.statusCode).to.equal(404);
        var messages = JSON.parse(body).results;
        var lastMessage = messages[messages.length - 1];
        expectedMessage = {
          username: lastMessage.username,
          message: lastMessage.message
        };
        
        expect(expectedMessage).to.eql(requestMessage);
        done();
      });

    });

  });
  //should get reverse chronological results with a order -createdAt query

  it('Should reverse order of results if order is -createAt', function(done) {
    var requestParams1 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Hello!'}
    };
    var message1 = requestParams1.json;
    request(requestParams1, function( error, response, body) {
    });

    var requestParams2 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'World!'}
    };

    setTimeout(function() {
      var message2 = requestParams2.json;
      request(requestParams2, function( error, response, body) {
      });
      
      request('http://127.0.0.1:3000/classes/messages?order=-createdAt', function( error, response, body) {
        var messages = JSON.parse(body).results;
        var firstMessage = messages[0];
        var lastMessage = messages[messages.length - 1];
        
        expectedFirstMessage = {
          username: firstMessage.username,
          message: firstMessage.message
        };
        expectedLastMessage = {
          username: lastMessage.username,
          message: lastMessage.message
        };
    
        expect(expectedFirstMessage).to.eql(message2);
        done();
      });


    }, 1000);
    
    
  });
  //make sure the database grew appropriately after adding certain number of messages
  //
  it('Should add correct number of messages', function(done) {
    var startDatabaseLength;
    request('http://127.0.0.1:3000/classes/messages?order=-createdAt', function( error, response, body) {
      var messages = JSON.parse(body).results;
      startDatabaseLength = messages.length;
    });

    var requestParams1 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Hello!'}
    };
    request(requestParams1, function( error, response, body) {
    });
    request(requestParams1, function( error, response, body) {
    });
    request(requestParams1, function( error, response, body) {
    });
    request(requestParams1, function( error, response, body) {
    });
    
    request('http://127.0.0.1:3000/classes/messages?order=-createdAt', function( error, response, body) {
      var messages = JSON.parse(body).results;
      expect(messages.length).to.equal(startDatabaseLength + 4);
      done();
    });
  
    
  });

});



















