'use strict';
var fs = require('fs');
var path = require('path');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var runEvent = require('./run-event');

var port = 9100;
var sslConfig;

try {
  // Try to read SSL config file and parse it as JSON.
  var sslConfigData = JSON.parse(fs.readFileSync(path.join(__dirname, './ssl-config.json')).toString());
  sslConfig = {
    key: fs.readFileSync(sslConfigData.key).toString(),
    cert: fs.readFileSync(sslConfigData.cert).toString()
  };
} catch (e) {
  console.error(e.stack);
  console.log('Error occured while reading SSL config file, proceeding without SSL.');
  // If there was an error while reading, proceed without setting a value to conf.
  sslConfig = undefined;
}

// Define app and use JSON body parser.
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set route for webhooks POST request.
var webhooksRouter = express.Router();
webhooksRouter.post('/', function (req, res) {
  // Read event from header.
  var event = req.headers['x-github-event'];
  if (event) {
    // Try running the event and end response with 204 (no content).
    try {
      runEvent(event, false, false);
    } catch (e) {
      console.error(e.stack);
    }
    res.status(204).end();
  } else {
    // Event is not set, end response with 400 (bad request).
    res.status(400).end();
  }
});
// Use router at /webhooks endpoint.
app.use('/webhooks', webhooksRouter);

// If config is set and it contains correct keys, start a https server on port.
if (sslConfig && typeof sslConfig.key === 'string' && typeof sslConfig.cert === 'string') {
  // Create a https server with passed `sslConfig` an listen on `port`.
  https.createServer(sslConfig, app).listen(port);
} else {
  // Config not passed, assuming https is not required, use regular http.
  app.listen(port);
}

console.log('webhooks router listening on ' + port);
