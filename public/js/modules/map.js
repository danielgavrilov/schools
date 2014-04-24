function Map(element, options) {
  var self = this;
  this.$searchHere = $('.search-here').hide();
  this.ignoreNextBoundChange = false;
  this.searchQueued = false;
  this.map = new google.maps.Map(element, _.extend({}, this.defaults, options));
  this.markers = [];
  // 'bounds_changed' is fired once the map is loaded.
  google.maps.event.addListenerOnce(this.map, 'bounds_changed', function() {
    self.show(app.results.visible());
    self.attachEvents();
    self.fitMarkers(true);
  });
}

Map.prototype.defaults = {
  backgroundColor: '#eee',
  center: new google.maps.LatLng(52, -1.5),
  zoom: 6,
  minZoom: 5,
  maxZoom: 17,
  scrollwheel: true,
  streetViewControl: false,
  mapTypeControl: false,
  overviewMapControl: false,
  styles: [{
    stylers: [
      { "saturation": -80 },
      { "gamma": 2 }
    ]
  }]
};

Map.prototype.icon = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 5,
  fillColor: '#333',
  fillOpacity: 0.9,
  strokeColor: 'white',
  strokeWeight: 1
};

Map.prototype.colors = {
  'A*': '#0d8a00',
  'A': '#0d8a00',
  'B': '#51b546',
  'C': '#8a8a8a',
  'D': '#c46e6e',
  'E': '#c10e0e',
};

Map.prototype.show = function(models) {
  this.empty();
  models.forEach(this.addMarker.bind(this));
};

Map.prototype.addMarker = function(model) {

  try {
    var coords = model.get('location').coordinates;
    var totalStudents = model.get('performance')[YEAR]['students']['a-level'];
    var aps = model.get('performance')[YEAR]['aps']['a-level']['entry'];
  } catch(e) {
    return;
  }

  var grade = app.helpers.grade(aps);
  var scale = Math.max(Math.sqrt(totalStudents)/1.8, 4) || 4;
  var zIndex = (totalStudents > 10) ? 10000 - totalStudents : 0;

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(coords[1], coords[0]),
    map: this.map,
    title: model.get('name'),
    icon: _.extend({}, this.icon, { 
      scale: scale,
      fillColor: this.colors[grade] || '#ccc'
    }),
    zIndex: zIndex,
  });

  marker.set('model', model);
  
  this.attachMarkerEvents(marker);
  this.markers.push(marker);
};

Map.prototype.fitMarkers = function(force) {
  var bounds = new google.maps.LatLngBounds();
  var mapBounds = this.map.getBounds();
  this.markers.forEach(function(marker) {
    bounds.extend(marker.getPosition());
  });
  if (this.markers.length) {
    if (mapBounds && !mapBounds.intersects(bounds)) { 
      this.map.fitBounds(bounds);
    } else if (force) {
      this.map.fitBounds(bounds);
      this.ignoreNextBoundChange = true;
    }
  }
};

Map.prototype.empty = function() {
  this.markers.forEach(function(marker) {
    marker.setMap(null);
  });
  this.markers = [];
};

Map.prototype.searchCenter = function(force) {
  var isNotNameSearch = !app.state.get('q').length;
  if (isNotNameSearch || force) {
    this.$searchHere.fadeOut();
    var position = this.map.getCenter();
    var coords = [position.lng(), position.lat()];
    var point = this.map.getBounds().getSouthWest();
    var distance = app.utils.calcDistance(coords, [coords[0], point.lat()], 'km') * 1000;
    distance = Math.round(distance);
    app.search.byLocation(coords, {distance: distance});
  } else {
    this.$searchHere.fadeIn();
  }
  this.searchQueued = false;
};

Map.prototype.attachEvents = function() {

  var self = this;

  this.$searchHere.on('click', function() {
    self.searchCenter(true);
  });

  function ignore() {
    self.ignoreNextBoundChange = false;
    self.searchQueued = false;
  }

  function queue() {
    if (!self.searchQueued) {
      self.searchQueued = true;
      if (self.ignoreNextBoundChange) google.maps.event.addListenerOnce(self.map, 'idle', ignore);
      else google.maps.event.addListenerOnce(self.map, 'idle', self.searchCenter.bind(self));
    }
  }

  google.maps.event.addListener(this.map, 'bounds_changed', queue);

  app.results.on('reset update', function() {
    self.show(app.results.visible());
    var isNameSearch = !!app.state.get('q').length;
    if (isNameSearch) self.fitMarkers(true);
  });

  app.compare.on('reset update', function() {

  });
};

Map.prototype.attachMarkerEvents = function(marker) {

  var self = this;
  var model = marker.get('model');

  google.maps.event.addListener(marker, 'click', function() {
    var inCompare = app.compare.contains(model);
    app.compare[inCompare ? 'remove' : 'add'](model);
  });

  google.maps.event.addListener(marker, 'mouseover', function() {
    model.set('hover', true);
  });

  google.maps.event.addListener(marker, 'mouseout', function() {
    model.set('hover', false);
  });

  model.on('change:hover', function(model, hoverValue) {
    marker.setIcon(_.extend({}, marker.icon, {
      strokeWeight: hoverValue ? 3 : 1,
      strokeColor: hoverValue ? 'black' : 'white'
    }));
  });

};