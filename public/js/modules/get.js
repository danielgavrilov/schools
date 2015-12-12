function onError(callback) {
  var tryCount = 0;
  var retryLimit = 2;
  return function(jqXHR, textStatus) {
    if (++tryCount < retryLimit) $.ajax(this);
    else callback(textStatus);
  };
}

app.get.byURNs = function(urns, callback) {
  if (!urns.length) return callback(null);
  $.ajax({
    dataType: 'json',
    url: '/api/schools',
    data: {
      urns: urns.join(',')
    },
    success: function(json) {
      callback(null, json.results, json);
    },
    error: onError(callback)
  });
};

app.get.byLocation = function(location, options, callback) {
  $.ajax({
    dataType: 'json',
    url: '/api/schools/near',
    data: {
      lng: location[0],
      lat: location[1],
      limit: options.limit,
      distance: options.distance
    },
    success: function(json) {
      callback(null, json.results, json);
    },
    error: onError(callback)
  });
};

app.get.postcode = function(postcode, callback) {
  postcode = postcode.replace(/\s+/g,'').toUpperCase();
  $.ajax({
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    dataType: 'json',
    data: {
      address: postcode,
      components: 'country:UK',
      region: 'uk'
    },
    success: function(json) {
      try {
        var location = json.results[0].geometry.location;
        callback(null, [location.lng, location.lat]);
      } catch(e) {
        callback(e);
      }
    },
    error: onError(callback)
  });
};