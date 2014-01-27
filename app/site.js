var fs = require('fs');
var path = require('path');
var express = require('express');
var ejs = require('ejs');
var app = module.exports = express();
var config = require('../config')();

var preload = {
  colornames: fs.readFileSync('./app/preload/colornames.js'),
  subjectnames: fs.readFileSync('./app/preload/subjectnames.js'),
  schoolnames: fs.readFileSync('./app/preload/schoolnames.js')
};

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './views'));

app.get('/:action?', function(req, res) {
  res.render('index.ejs', {
    YEAR: config.YEAR,
    preload: preload
  });
});

app.use(express.static(path.resolve(__dirname, '../public')));