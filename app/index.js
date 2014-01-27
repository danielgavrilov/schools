var express = require('express');
var api = require('./api');
var site = require('./site');

var app = express();
var port = process.env.PORT || 8000;

app.use(express.favicon());
app.configure('production', function() {
  app.use(require('logfmt').requestLogger());
});
app.configure('development', function() {
  app.use(express.logger('dev'));
});
app.use(express.compress());
app.use('/api', api);
app.use(site);
app.use(express.errorHandler());

app.listen(port, function() {
  console.log('Listening on ' + port);
});