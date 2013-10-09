var pg = require('pg');

exports.Client = Client;

function Client(config) {
  ClientDecorator.call(this, new pg.Client(config));
}
Client.prototype = Object.create(ClientDecorator.prototype);
Client.md5 = pg.Client.md5;


Object.defineProperty(exports, 'pools', {
  get: function() {
    return pg.pools;
  },
  configurable: true
});

exports.connect = function() {
  var args = [].slice.call(arguments);

  if (typeof args.slice(-1)[0] == 'function') {
    var cb = args.pop();
    return pg.connect.apply(pg, args.concat(function(err, client, done) {
      err ? cb(err) : cb(err, new ClientDecorator(client, done), done);
    }));
  }

  return function(cb) {
    pg.connect.apply(pg, args.concat(function(err, client, done) {
      err ? cb(err) : cb(err, new ClientDecorator(client, done));
    }));
  };
};


function ClientDecorator(client, done) {
  this.client = client;
  if (done) {
    this.free = this.done = done;
  }
}

ClientDecorator.prototype.connect = function(callback) {
  var self = this;
  if (callback) {
    return this.client.connect(function(err) {
      callback(err, self);
    });
  }

  return function(done) {
    self.client.connect(function(err) {
      done(err, self);
    });
  }
};

ClientDecorator.prototype.query = function() {
  var args = [].slice.call(arguments);

  if (typeof args.slice(-1)[0] == 'function') {
    return this.client.query.apply(this.client, args);
  }

  var self = this;
  return function(done) {
    return self.client.query.apply(self.client, done ? args.concat(done) : args);
  }
};

// events.EventEmitter
['on', 'addListener', 'once', 'removeListener', 'removeAllListeners', 'listeners', 'emit'].forEach(function(name) {
  ClientDecorator.prototype[name] = function() {
    return this.client[name].apply(this.client, arguments);
  }
});

// pg.Client
['cancel', 'escapeIdentifier', 'escapeLiteral', 'copyFrom', 'copyTo', 'end'].forEach(function(name) {
  ClientDecorator.prototype[name] = function() {
    return this.client[name].apply(this.client, arguments);
  }
});






