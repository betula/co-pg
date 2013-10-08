
var co = require('co');
var pg = require('..');
var assert = require('assert');

var conString = "postgres://postgres:1234@localhost/postgres";

describe('Simple', function() {

  it('should work', function(done) {
    co(function *() {

      var client = new pg.Client(conString);
      yield client.connect();

      var result = yield client.query('SELECT NOW() AS "theTime"');

      assert(String(result.rows[0].theTime).indexOf(new Date().getFullYear()) != -1);
      client.end();

      done();
    });
  });
});

describe('Client pooling', function() {

  it('should work', function(done) {
    co(function *() {

      var client = yield pg.connect(conString);
      var result = yield client.query('SELECT $1::int AS numbor', ['1']);
      client.done();
      assert(result.rows[0].numbor === 1);

      done();
    });
  });
});