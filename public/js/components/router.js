app.routers.main = Backbone.Router.extend({
  routes: {
    '': 'search',
  },
  search: function(params) {
    params = params || {};
    var query = params.q;
    var location = (params.lng != null) && (params.lat != null) && [params.lng, params.lat];
    if (query) app.search.query(query);
    else if (location) app.search.byLocation(location);
  },
});