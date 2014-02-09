var fs = require('fs');
var path = require('path');
var express = require('express');
var ejs = require('ejs');
var app = module.exports = express();
var config = require('../config');

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './views'));

app.get('/', function(req, res) {
  res.render('index.ejs', {
    YEAR: config.YEAR,
    ENV: app.get('env')
  });
});

app.use(express.static(path.resolve(__dirname, '../public')));