app.routers.main = Backbone.Router.extend({
  routes: {
    '': 'search',
  },
  initialize: function() {
    this.listenTo(app.state, 'change', _.debounce(this._navigateFromState, 500));
  },
  parseParams: function(params) {
    params = params || {};
    var typeArray = ['compare', 'exclude', 'subjects'];
    for (var prop in params) {
      if (_.contains(typeArray, prop)) params[prop] = params[prop].split(',');
    }
    return params;
  },
  search: function(params) {
    params = this.parseParams(params);
    // q
    if (params.q) app.search.query(params.q);
    // lat, lng
    else if (params.lng != null && params.lat != null) {
      app.search.byLocation([params.lng, params.lat]);
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
  _encodeState: function() {
    var params = app.state.filtered();
    var props = [];
    for (var prop in params) {
      var value = params[prop];
      if (_.isArray(value)) value.join(',');
      props.push(prop+'='+value);
    }
    var encoded = (props.length > 0) ? ('?'+props.join('&')) : '';
    return encoded;
  },
  _navigateFromState: function() {
    this.navigate(this._encodeState(), {replace: true});
  }
});