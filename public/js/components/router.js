app.router = new (Backbone.Router.extend({
  routes: {
    '': 'search',
  },
  search: function(params) {
    params = params || {};
    var query = params.q || params.postcode;
    var location = params.lng && params.lat && [params.lng, params.lat];
    if (query) app.search.query(query);
    else if (location) app.search.byLocation(location);
  },
}));