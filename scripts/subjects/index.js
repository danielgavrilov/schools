var mongojs = require('mongojs');
var db = mongojs('ks5', ['schools']);
var schools = db.schools;
var config = require('../../config')();

var projection = {_id: 0};
projection['performance.'+config.YEAR+'.results.a-level'] = 1;

exports.getNames = function(callback) {
  schools.find({}, projection, function(err, results) {
    if (err) throw err;
    subjects = {};
    results.forEach(function(school) {
      try {
        var keys = Object.keys(school['performance'][config.YEAR]['results']['a-level']);
        keys.forEach(function(subject) {
          subjects[subject] = 1;
        });
      } catch(e) {}
    });
    return callback(Object.keys(subjects));
  });
};