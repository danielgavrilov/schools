var config = require('../config');
var mongojs = require('mongojs');
var express = require('express');
var db = mongojs(config.DATABASE_URL, ['schools']);
var schools = db.schools;
var app = module.exports = express();

function validURN(urn) {
  if (isNaN(urn) || urn.length !== 6) return;
  return urn;
}

function between(lower, upper, defaultValue) {
  return function(n) {
    n = +n;
    if (isNaN(n)) return defaultValue;
    if (n > upper) return upper;
    if (n < lower) return lower;
    return n;
  };
}

var schoolLimit = between(1, 100, 50);
var distanceLimit = between(0, 80000, 80000);

function positionFromURN(req, res, next) {

  if (!req.query.urn) return next();

  var urn = validURN(req.query.urn);

  if (!urn) return res.jsonp(400, { 
    error: "Invalid URN: must be a 6-digit integer."
  });

  schools.find({_id: urn}, {location: 1}, {limit: 1}, function(err, results) {
    if (err) return next(err);
    try {
      var coords = results[0].location.coordinates;
      req.lng = coords[0];
      req.lat = coords[1];
      next();
    } catch(e) {
      res.jsonp(404, { 
        error: "Location unavailable for the specified school."
      });
    }
  });
}

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

app.get('/schools/near', positionFromURN, parseLngLat, function(req, res, next) {
  
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