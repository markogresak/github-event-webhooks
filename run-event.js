var exec = require('child_process').exec;
var resolve = require('path').resolve;

/**
 * Run an event from events folder.
 *
 * @param   {string}         event        Name of event to run.
 * @param   {boolean}        logStdout    Should stdout be logged?
 * @param   {boolean = true} throwExecErr Should throw error in exec?
 */
module.exports = function (event, logStdout, throwExecErr) {
  'use strict';

  if (throwExecErr === undefined) {
    throwExecErr = true;
  }

  if (typeof event !== 'string') {
    throw new Error('Event is not a string!');
  }

  // Resolve path to event file and execute the file.
  exec(resolve(__dirname, 'events', event), function (err, stdout, stderr) {
    if (err) {
      if (throwExecErr) {
        throw err;
      }
      else {
        console.log(err.stack);
      }
    }

    if (stderr) {
      console.error(stderr);
    }

    if (logStdout && stdout) {
      console.log(stdout);
    }
  });
};
