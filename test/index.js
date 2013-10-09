
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

  it('client md5 method should work', function() {
    var md5 = pg.Client.md5('hello');
    assert(md5 == '5d41402abc4b2a76b9719d911017c592');
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
