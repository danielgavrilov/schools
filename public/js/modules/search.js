var rePostcode     = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
var reLikePostcode = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?(\d([A-Z]{1,2})?)?$/i;

app.views.search = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, '_handleResponse', '_handleResponseError');
    this.$input = this.$el.find('.search-input');
    this.$useLocation = this.$el.find('.use-location');
  },
  events: {
    'input': '_onInput',
    'submit': '_onSubmit',
    'click .use-location': function(event) {
      this._updateQuery(null);
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
    var searchPattern = query.split(/\s/).join('.+');
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
    app.schools.distanceFrom();
  },
  byPostcode: function(postcode) {
    this._updateQuery(postcode);
  },
  byLocation: function(location) {
    app.get.byLocation(location, function(err, schools, resp) {
      var urns = _.pluck(schools, '_id');
      var location = resp.near && resp.near.location;
      app.cache.add(schools);
      app.results.resetURNs(urns);
      app.schools.distanceFrom(location);
      app.state.set({
        lng: location[0],
        lat: location[1]
      });
    });
  },
  byCurrentLocation: function(event) {
    if ('geolocation' in navigator) {
      this.$useLocation.addClass('loading');
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
  _onInput: function(event) {
    this.query(this.$input.val());
    event.preventDefault();
  },
  _onSubmit: function(event) {
    this.query(this.$input.blur().val());
    event.preventDefault();
  },
  _updateQuery: function(value) {
    var old = this.$input.val();
    if (value !== old) this.$input.val(value);
    app.state.set({
      q: value,
      lat: null,
      lng: null
    });
  }
});