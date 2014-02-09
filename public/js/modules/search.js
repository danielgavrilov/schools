var rePostcode     = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\s*$/i;
var reLikePostcode = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?(\d([A-Z]{1,2})?)?$/i;

app.views.search = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, '_handleResponse', '_handleResponseError');
    this.$input = this.$el.find('.search-input');
    this.$useLocation = this.$el.find('.use-location');
  },
  events: {
    'input': function(event) {
      this.query(this.$input.val());
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
        if (urns.length >= 20) break;
      }
    }
    app.schools.sorting.sort(null);
    app.results.resetURNs(urns);
    app.schools.hideDistance();
  },
  byPostcode: function(postcode) {
    var self = this;
    this._updateQuery(postcode);
    app.get.postcode(postcode, function(err, location) {
      if (!err) self.byLocation(location, {postcode: true});
    });
  },
  byLocation: function(location, options) {
    var self = this;
    options = options || {};
    app.get.byLocation(location, function(err, schools, resp) {
      var urns = _.pluck(schools, '_id');
      var location = resp.near && resp.near.location;
      app.cache.add(schools);
      app.results.resetURNs(urns);
      app.schools.showDistance();
      app.state.set({
        lng: location[0],
        lat: location[1]
      });
      if (!options.postcode) self._updateQuery();
    });
  },
  byCurrentLocation: function(event) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(this._handleResponse, this._handleResponseError);
    }
  },
  _handleResponse: function(response) {
    var location = [response.coords.longitude, response.coords.latitude];
    this.byLocation(location);
  },
  _handleResponseError: function(err) {
    // err.code:
    // PERMISSION_DENIED (1) if the user clicks that “Don’t Share” button or otherwise denies you access to their location.
    // POSITION_UNAVAILABLE (2) if the network is down or the positioning satellites can’t be contacted.
    // TIMEOUT (3) if the network is up but it takes too long to calculate the user’s position. How long is “too long”? I’ll show you how to define that in the next section.
  },
  _updateQuery: function(value) {
    this.$input.val(value);
    app.state.set({
      q: value
    });
  }
});