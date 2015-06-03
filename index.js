'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var runEvent = require('./run-event');

var port = 9100;


// Define app and use JSON body parser.
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set route for webhooks POST request.
var webhooksRouter = express.webhooksRouter();
webhooksRouter.post('/', function (req, res) {
  // Read event from header.
  var event = req.headers['X-Github-Event'];
  if (event) {
    // Run event and end response with 204 (no content).
    runEvent(event);
    res.status(204).end();
  } else {
    // Event is not set, end response with 400 (bad request).
    res.status(400).end();
  }
});
// Use router at /webhooks endpoint.
app.use('/webhooks', webhooksRouter);

  app.listen(port);
console.log('webhooksRouter listening on ' + port);
