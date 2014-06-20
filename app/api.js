var config = require('../config');
var mongojs = require('mongojs');
var express = require('express');
var db = mongojs(config.DATABASE_URL, ['schools']);
var schools = db.schools;
var app = module.exports = express();

// Given a string, it returns
// - the string itself, if it's in a valid URN format
// - undefined if it's an invalid URN format
function validURN(urn) {
  if (isNaN(urn) || urn.length !== 6) return;
  return urn;
}

// Returns a function that "clamps" values passed to it
function between(min, max, defaultValue) {
  return function(n) {
    n = +n;
    if (isNaN(n)) return defaultValue;
    if (n > max) return max;
    if (n < min) return min;
    return n;
  };
}

var schoolLimit = between(1, 100, 50);
var distanceLimit = between(0, 80000, 80000);

// Middleware for parsing longitude and latitude.
// 
// If query parameters `lng` and `lat` are provided, it:
// - attaches them as properties of the request, if they are valid
// - responds with an appropriate error, if they are invalid
// 
// If they are not provided, the request is passed onto
// the next middleware.
function parseLngLat(req, res, next) {
  if (!req.query.lat || !req.query.lng) return next();

  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);

  if (isNaN(lng) || isNaN(lat)) return res.jsonp(400, {
    error: "Invalid lat/lng coordinates provided."
  });

  req.lng = lng;
  req.lat = lat;
  next();
}

// Enable Cross-Origin Resource Sharing (CORS)
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/schools', function(req, res, next) {

  var urns;

  if (req.query.urns) {
    urns = req.query.urns.split(',');
    urns = urns.map(validURN).filter(function(urn) { return urn != null; });
  }

  var query = urns ? {_id: {$in: urns}} : {};
  var limit = schoolLimit(req.query.limit);

  schools.find(query, {limit: limit}, function(err, results) {
    if (err) return next(err);
    res.jsonp({results: results});
  });
});

app.get('/schools/near', parseLngLat, function(req, res, next) {
  
  if (req.lng === undefined || req.lat === undefined) return res.jsonp(400, {
    error: "No valid location was provided."
  });

  var distance = distanceLimit(req.query.distance);
  var limit = schoolLimit(req.query.limit);
  var coords = [req.lng, req.lat];

  schools.find({ 
    location: {
      $near: { 
        $geometry: { 
          type: "Point",
          coordinates: coords
        } 
      },
      $maxDistance: distance
    }
  }, {limit: limit}, function(err, results) {
    if (err) return next(err);
    res.jsonp({
      near: {
        location: coords
      },
      results: results 
    });
  });
});

app.get('/', function(req, res, next) {
  res.jsonp(200, {
    message: 'A-level schools API at your service.'
  });
});

app.use(function(err, req, res, next) {
  console.log(err);
  res.jsonp(500, {
    error: 'Something went wrong.'
  });
});