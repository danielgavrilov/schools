var config = require('../../config');
var mongojs = require('mongojs');
var db = mongojs(config.DATABASE_URL, ['schools']);
var schools = db.schools;

exports.getNames = function(callback) {
  schools.find({}, {name: 1, _id: 1}, function(err, results) {
    if (err) throw err;
    schools = {};
    results.forEach(function(school) {
      schools[school._id] = school.name;
    });
    return callback(schools);
  });
};