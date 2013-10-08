var pg = require('pg');

function Client() {
  var args = [].slice.call(arguments);
  ClientDecorator.call(this, new pg.Client(args));
}
Client.prototype = Object.create(ClientDecorator.prototype);

exports.Client = Client;


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
    this.done = done;
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
['cancel', 'escapeIdentifier', 'escapeLiteral', 'copyFrom', 'copyTo', 'end', 'md5'].forEach(function(name) {
  ClientDecorator.prototype[name] = function() {
    return this.client[name].apply(this.client, arguments);
  }
});





