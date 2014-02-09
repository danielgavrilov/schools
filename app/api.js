var mongojs = require('mongojs');
var express = require('express');
var db = mongojs(process.env.DATABASE_URL, ['schools']);
var schools = db.schools;
var app = module.exports = express();

function validURN(urn) {
  urn = urn.toString().trim();
  if (isNaN(urn) || urn.length !== 6) return;
  return urn;
}

function between(lower, number, upper) {
  number = +number;
  if (isNaN(number) || number > upper) return upper;
  if (number < lower) return lower;
  return number;
}

function positionFromURN(req, res, next) {
  if (!req.query.urn) return next();
  var urn = validURN(req.query.urn);
  if (!urn) return res.json(400, { 
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
      res.json(404, { 
        error: "Location unavailable for the specified school."
      });
    }
  });
}

function parseLngLat(req, res, next) {
  if (!req.query.lat || !req.query.lng) return next();
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);
  if (isNaN(lng) || isNaN(lat)) return res.json(400, {
    error: "Invalid lat/lng coordinates provided."
  });
  req.lng = lng;
  req.lat = lat;
  next();
}

app.get('/schools', function(req, res, next) {
  var urns;
  if (req.query.urns) {
    urns = req.query.urns.split(',');
    urns = urns.map(validURN).filter(function(urn) { return urn != null; });
  }
  var query = urns ? {_id: {$in: urns}} : {};
  var limit = between(1, req.query.limit, 50);
  schools.find(query, {limit: limit}, function(err, results) {
    if (err) return next(err);
    res.json({results: results});
  });
});

app.get('/schools/near', positionFromURN, parseLngLat, function(req, res, next) {
  if (req.lng === undefined || req.lat === undefined) return res.json(400, {
    error: "No valid location was provided."
  });
  var distance = between(1, distance, 80000);
  var limit = between(1, req.query.limit, 50);
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
    res.json({ 
      near: {
        location: coords
      },
      results: results 
    });
  });
});

app.get('/', function(req, res, next) {
  res.json(200, {
    message: 'A-level schools API at your service.'
  });
});

app.use(function(err, req, res, next) {
  console.log(err);
  res.json(500, {
    error: 'Something went wrong.'
  });
});