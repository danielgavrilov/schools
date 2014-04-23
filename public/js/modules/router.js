app.routers.main = Backbone.Router.extend({
  routes: {
    '': 'search',
  },
  initialize: function() {
    this.listenTo(app.state, 'change', _.debounce(this._navigateFromState, 500));
  },
  parseParams: function(params) {
    params = params || {};
    var isArray = ['compare', 'exclude', 'subjects'];
    params.p = decodeURIComponent(params.p);
    for (var prop in params) {
      if (_.contains(isArray, prop)) { 
        params[prop] = params[prop].split(',').map(decodeURIComponent);
      }
    }
    return params;
  },
  search: function(params) {
    params = this.parseParams(params);
    // q
    if (params.q) app.search.query(params.q);
    // lat, lng
    else if (params.lng != null && params.lat != null) {
      app.search.byLocation([params.lng, params.lat], {distance: params.distance});
    } 
    // sort
    if (params.sort) {
      var sort = params.sort.split(':');
      var key = sort[0];
      var order = sort[1];
      app.schools.sorting.sort(key, order); 
    }
    // compare
    if (params.compare) app.compare.addURNs(params.compare);
    // exlude (filter)
    if (params.exclude) params.exclude.forEach(function(name) {
      app.filters.exclude(name);
    });
    // subjects
    if (params.subjects) params.subjects.forEach(function(subject) {
      app.subjects.selectByName(subject);
    });
  },
  _serializeState: function() {
    var params = app.state.filtered();
    var props = [];
    for (var prop in params) {
      var value = params[prop];
      if (prop === 'q') value = encodeURIComponent(value);
      if (_.isArray(value)) { 
        value = value.map(encodeURIComponent).join(',');
      }
      props.push(prop+'='+value);
    }
    var encoded = (props.length > 0) ? ('?'+props.join('&')) : '';
    return encoded;
  },
  _navigateFromState: function() {
    this.navigate(this._serializeState(), {replace: true});
  }
});