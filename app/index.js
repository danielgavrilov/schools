if (process.env.NODE_ENV === 'production') var newrelic = require('newrelic');
var path = require('path');
var ejs = require('ejs');
var config = require('../config');
var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './views'));

app.use(express.favicon());
app.use(require('logfmt').requestLogger());
app.use(express.compress());
app.use('/api', require('./api'));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.errorHandler());

app.get('/', function(req, res) {
  res.render('index.ejs', {
    YEAR: config.YEAR
  });
});

app.listen(port, function() {
  console.log('Listening on ' + port);
});