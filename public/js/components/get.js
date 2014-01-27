function onError(callback) {
  var tryCount = 0;
  var retryLimit = 2;
  return function(jqXHR, textStatus) {
    if (++tryCount < retryLimit) $.ajax(this);
    else callback(textStatus);
  };
}

app.get.byURNs = function(urns, callback) {
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

app.get.byLocation = function(location, callback) {
  $.ajax({
    dataType: 'json',
    url: '/api/schools/near',
    data: {
      lng: location[0],
      lat: location[1],
      limit: 20
    },
    success: function(json) {
      callback(null, json.results, json);
    },
    error: onError(callback)
  });
};

app.get.byPostcode = function(postcode, callback) {
  $.ajax({
    dataType: 'json',
    url: '/api/schools/near',
    data: {
      postcode: postcode,
      limit: 20
    },
    success: function(json) {
      callback(null, json.results, json);
    },
    error: onError(callback)
  });
};