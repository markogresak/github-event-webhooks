'use strict';
var fs = require('fs');
var path = require('path');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var runEvent = require('./run-event');

var port = 9100;
var conf;

try {
  // Try to read SSL config file and parse it as JSON.
  conf = JSON.parse(fs.readFileSync(path.join(__dirname, './ssl-config.json')).toString());
} catch (e) {
  // If there was an error while reading, proceed without setting a value to conf.
  conf = undefined;
}

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

// If config is set and it contains correct keys, start a https server on port.
if (conf && typeof conf.key === 'string' && typeof conf.cert === 'string') {
  // Create a https server with passed `conf` an listen on `port`.
  https.createServer(conf, app).listen(port);
} else {
  // Config not passed, assuming https is not required, use regular http.
  app.listen(port);
}

console.log('webhooksRouter listening on ' + port);
