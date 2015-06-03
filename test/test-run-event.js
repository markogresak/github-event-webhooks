/* jshint expr: true */
'use strict';
var chai = require('chai');
var sinon = require('sinon');
chai.should();
chai.use(require('sinon-chai'));

var path = require('path');
var rewire = require('rewire');
var runScript = rewire('../run-event');

describe('run-script', function () {

  var eventName, eventPath, revertRewire;

  beforeEach(function (done) {
    eventName = 'event';
    eventPath = path.resolve(__dirname, '../events', eventName);
    revertRewire = runScript.__set__('exec', function   () {});
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    done();
  });

  afterEach(function (done) {
    console.log.restore();
    console.error.restore();
    if (revertRewire) {
      revertRewire();
    }
    done();
  });

  it('should throw an error if event is not of type string', function (done) {
    runScript.bind(runScript, 123).should.throw(Error);
    runScript.bind(runScript, eventName).should.not.throw(Error);
    done();
  });

  it('should call exec with path to event file', function (done) {
    var execMock = function (path) {
      path.should.equal(eventPath);
    };
    revertRewire = runScript.__set__('exec', execMock);
    runScript(eventName);
    done();
  });

  it('should throw an error if there was error with exec', function (done) {
    var execMock = function (path, cb) {
      cb.bind(cb, Error()).should.throw(Error);
    };
    revertRewire = runScript.__set__('exec', execMock);
    runScript(eventName);
    done();
  });

  it('should not output stdout if called with logStdout = false', function (done) {
    var execMock = function (path, cb) {
      var stdoutText = 'stdout';
      cb(null, stdoutText);
      console.log.should.not.have.been.called;
    };
    revertRewire = runScript.__set__('exec', execMock);
    runScript(eventName);
    runScript(eventName, false);
    done();
  });

  it('should output stdout if called with logStdout = true', function (done) {
    var execMock = function (path, cb) {
      var stdoutText = 'stdout';
      cb(null, stdoutText);
      console.log.should.have.been.calledWith(stdoutText);
    };
    revertRewire = runScript.__set__('exec', execMock);
    runScript(eventName, true);
    done();
  });

  it('should always output stderr called with logStdout = false', function (done) {
    var execMock = function (path, cb) {
      var stdoutText = 'stdout', stderrText = 'stderr';
      cb(null, stdoutText, stderrText);
      console.error.should.have.been.calledWith(stderrText);
    };
    revertRewire = runScript.__set__('exec', execMock);
    runScript(eventName);
    done();
  });

});
