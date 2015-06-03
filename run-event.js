var exec = require('child_process').exec;
var resolve = require('path').resolve;

/**
 * Run an event from events folder.
 *
 * @param   {string}  event     Name of event to run.
 * @param   {boolean} logStdout Should stdout be logged?
 */
module.exports = function (event, logStdout) {
  'use strict';

  if (typeof event !== 'string') {
    throw new Error('Event is not a string!');
  }

  // Resolve path to event file and execute the file.
  exec(resolve(__dirname, 'events', event), function (err, stdout, stderr) {
    if (err) {
      throw err;
    }

    if (stderr) {
      console.error(stderr);
    }

    if (logStdout && stdout) {
      console.log(stdout);
    }
  });
};
