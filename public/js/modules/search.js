var rePostcode     = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\s*$/i;
var reLikePostcode = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?(\d([A-Z]{1,2})?)?$/i;

app.views.search = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, '_handleResponse', '_handleResponseError');
    this._debouncedQuery = _.debounce(this.query, 200);
    this.$input = this.$el.find('.search-input');
    this.$useLocation = this.$el.find('.use-location');
  },
  events: {
    'input': function(event) {
      this._debouncedQuery(this.$input.val());
      event.preventDefault();
    },
    'submit': function(event) {
      this.query(this.$input.blur().val());
      event.preventDefault();
    },
    'click .use-location': function(event) {
      this.byCurrentLocation();
      event.preventDefault();
    }
  },
  query: function(query) {
    var len = query.length;
    if (rePostcode.test(query)) this.byPostcode(query);
    else if (len === 0 || (len >= 3 && !reLikePostcode.test(query))) this.byName(query);
  },
  byName: function(query) {
    this._updateQuery(query);
    var searchPattern = query.split(/\s/g).join('.+');
    var re = new RegExp(searchPattern, 'i');
    var names = app.preload.schoolnames;
    var urns = [];
    if (query.length > 0) {
      for (var urn in names) {
        if (re.test(names[urn])) urns.push(urn);
        if (urns.length >= 50) break;
      }
    }
    var urnsToLoad = urns.filter(function(urn) {
      return !app.cache.get(urn);
    });
    app.schools.loadingStart();
    app.get.byURNs(urnsToLoad, function(err, schools) {
      app.cache.add(schools);
      app.schools.hideDistance();
      app.results.resetURNs(urns);
      app.schools.loadingEnd();
      app.map.fitMarkers(true);
      app.state.set({
        lat: null,
        lng: null,
        distance: null
      });
    });
  },
  byPostcode: function(postcode) {
    var self = this;
    this._updateQuery(postcode);
    app.schools.loadingStart();
    app.get.postcode(postcode, function(err, location) {
      if (!err) { 
        self.byLocation(location, {postcode: true, centerMap: true, limit: 50}); 
        app.state.set('distance', null);
      }
    });
  },
  byLocation: function(location, options) {
    var self = this;
    options = options || {};
    app.schools.loadingStart();
    if (!options.postcode) self._updateQuery('');
    app.get.byLocation(location, options, function(err, schools, resp) {
      var urns = _.pluck(schools, '_id');
      var location = resp.near && resp.near.location;
      if (!app.results.comparator) app.schools.sorting.sort('distance', 'asc');
      app.cache.add(schools);
      app.schools.showDistance();
      app.results.resetURNs(urns);
      app.schools.loadingEnd();
      app.state.set({
        lng: location[0],
        lat: location[1]
      });
      if (options.centerMap) app.map.fitMarkers(true);
      if (options.distance) app.state.set('distance', options.distance);
    });
  },
  byCurrentLocation: function(event) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(this._handleResponse, this._handleResponseError);
    }
  },
  _handleResponse: function(response) {
    var location = [response.coords.longitude, response.coords.latitude];
    this.byLocation(location, {centerMap: true});
  },
  _handleResponseError: function(err) {
    // err.code:
    // PERMISSION_DENIED (1) if the user clicks that “Don’t Share” button or otherwise denies you access to their location.
    // POSITION_UNAVAILABLE (2) if the network is down or the positioning satellites can’t be contacted.
    // TIMEOUT (3) if the network is up but it takes too long to calculate the user’s position. How long is “too long”? I’ll show you how to define that in the next section.
  },
  _updateQuery: function(value) {
    // The IF statement prevents "cursor-jumping" bugs
    if (value != this.$input.val()) this.$input.val(value);
    app.state.set({
      q: value
    });
  }
});