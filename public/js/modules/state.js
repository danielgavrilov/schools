app.models.state = Backbone.Model.extend({
  defaults: {
    q: '',
    lat: null,
    lng: null,
    distance: null,
    sort: null,
    compare: [],
    exclude: [],
    subjects: [],
  },
  initialize: function() {
    _.bindAll(this, '_triggerLocation');
    this.on('change:lat change:lng', this._triggerLocation);
    this.listenTo(app.compare, 'add remove reset', this._setCompare);
    this.listenTo(app.subjects, 'selection', this._setSubjects);
  },
  getLocation: function() {
    return [this.get('lng'), this.get('lat')];
  },
  // Removes properties with values: null, empty strings and empty arrays
  filtered: function() {
    var state = this.toJSON();
    var filtered = {};
    for (var prop in state) {
      var value = state[prop];
      if (value == null || value === '') continue;
      if (_.isArray(value) && value.length === 0) continue;
      filtered[prop] = value;
    }
    if (filtered.q) {
      delete filtered.lat;
      delete filtered.lng;
    }
    return filtered;
  },
  _setCompare: function() {
    this.set('compare', app.compare.pluck('_id'));
  },
  _setSubjects: function() {
    var subjects = app.subjects.selected().map(function(model) {
      return model.get('name');
    });
    this.set('subjects', subjects);
  },
  _triggerLocation: _.debounce(function() {
    this.trigger('change:location', [this.get('lng'), this.get('lat')]);
  }, 10)
});