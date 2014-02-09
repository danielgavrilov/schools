app.models.school = Backbone.Model.extend({
  idAttribute: '_id',
  initialize: function() {
    _.bindAll(this, '_loadedCheck');
    this.loading = false;
    this.on('change', _.debounce(this._loadedCheck, 10));
    this.listenTo(app.state, 'change:location', this.updateDistance);
    this.onload(this._parseData);
  },
  // Whether the model is loaded.
  // Chosen "address" property simply because it exists for every school.
  loaded: function() {
    return !!this.get('address');
  },
  onload: function(callback) {
    if (this.loaded()) callback.call(this);
    else this.on('loaded', callback);
  },
  getSubject: function(name) {
    try {
      return this.get('performance')[YEAR]["results"]["a-level"][name];
    } catch(e) {
      return {};
    }
  },
  updateDistance: function() {
    try {
      var current = this.get('location').coordinates;
      var reference = app.state.getLocation();
      var distance = app.utils.calcDistance(current, reference);
      this.set('distance', distance);
    } catch(e) {}
  },
  _loadedCheck: function() {
    if (this.loading && this.loaded()) {
      this.loading = false;
      this.trigger('loaded');
    }
  },
  _parseData: function() {
    this.set('supertype', app.helpers.getSuperType(this.get('type')));
  }
});

app.views.school = Backbone.View.extend({
  tagName: 'tr',
  className: 'school',
  template: app.templates.school,
  loadingTemplate: app.templates.schoolLoading,
  initialize: function() {
    this.listenTo(this.model, 'change:distance', this.updateDistance);
    if (this.model.loaded()) {
      this.render();
    } else {
      this.renderLoading();
      this.listenTo(this.model, 'loaded', this.render);
    }
  },
  events: {
    'click .add-compare': '_addToCompare',
    'click .remove-compare': '_removeFromCompare'
  },
  render: function() {
    var data = this.model.toJSON();
    var html = this.template(data);
    this.$el.html(html);
    this.$distance = this.$('.distance');
    this.updateDistance();
    this.performance = new app.views.performance({
      el: this.$('td.performance'),
      model: this.model
    });
  },
  renderLoading: function() {
    var html = this.loadingTemplate(this.model.toJSON());
    this.$el.html(html);
  },
  updateDistance: function() {
    var value = this.model.get('distance');
    try {
      value = value.toFixed(1);
    } catch(e) {}
    this.$distance.html(value);
  },
  remove: function() {
    if (this.performance) this.performance.remove();
    delete this.performance;
    return Backbone.View.prototype.remove.call(this);
  },
  _addToCompare: function() {
    app.compare.add(this.model);
  },
  _removeFromCompare: function() {
    app.compare.remove(this.model);
  },
});

app.views.performance = Backbone.View.extend({
  template: app.templates.performance,
  initialize: function() {
    _.bindAll(this, 'generateSubject', 'render');
    this.elements = {};
    this.listenTo(app.subjects, 'focus', this._onFocus);
    this.listenTo(app.subjects, 'unfocus', this._onUnfocus);
    this.listenTo(app.subjects, 'selection', this.render);
    this.render();
  },
  events: {
    'mouseenter .subject': function(event) {
      var focused = app.subjects.focused();
      var name = $(event.currentTarget).data('subject');
      if (focused && focused.get('name') === name) return;
      if (focused) focused.unfocus();
      app.subjects.getByName(name).focus();
    },
    'mouseleave': function(event) {
      var focused = app.subjects.focused();
      if (focused) focused.unfocus();
    }
  },
  render: function() {
    var self = this;
    var selected = app.subjects.selected();
    this.el.innerHTML = '';
    if (selected.length) {
      var elems = selected.map(this.generateSubject);
      var fragment = app.utils.arrayToFragment(elems);
      this.$el.append(fragment);
      // deferring _fixOverlaps significantly increases
      // perceived performance.
      _.defer(function() { self._fixOverlaps(elems); });
    } else {
      this.$el.html('<p>No subjects selected.</p>');
    }
  },
  generateSubject: function(subject) {
    var self = this;
    subject = subject.toJSON();
    var name = subject.name;
    subject = _.extend(subject, this.model.getSubject(name));
    var data = this._prepareData(subject);
    var html = this.template(data);
    var element = app.utils.elementFromHTML(html);
    this.elements[name] = element;
    return element;
  },
  _prepareData: function(subject) {
    var toPerc = app.utils.toPercentage;
    if (subject["A"] != null) {
      var AtoA = subject["A*"] + subject["A"];
      var AtoC = AtoA + subject["B"] + subject["C"];
      var NR = subject["NR"];
      var total = subject["total"];
      _.extend(subject, {
        "a-a": {
          "num": AtoA || "",
          "perc": toPerc(AtoA/total),
        },
        "a-c": {
          "num": AtoC || "",
          "perc": toPerc(AtoC/total)
        },
        "no-result": {
          "num": NR || "",
          "perc": toPerc(NR/total)
        }
      });
    }
    return subject;
  },
  _fixOverlaps: function(elems) {
    elems.forEach(function(elem) {
      var $elem = $(elem);
      if (!$elem.hasClass('no-entries') && !$elem.hasClass('suppressed')) {
        var $AtoA = $elem.find('.a-a span');
        var $AtoC = $elem.find('.a-c span');
        var $NR = $elem.find('.no-result span');
        var $entries = $elem.find('.entries');
        var overlap = app.utils.overlap;
        if (overlap($AtoA[0], $AtoC[0])) $AtoA.addClass('swap');
        if (overlap($AtoC[0], $entries[0]) || overlap($AtoC[0], $NR[0])) $AtoC.addClass('swap');
        if (overlap($AtoC[0], $NR[0])) $NR.hide();
        if (overlap($AtoA[0], $AtoC[0])) $AtoA.addClass('swap');
      }
    });
  },
  _onFocus: function(name) {
    this.elements[name].classList.add('focus');
  },
  _onUnfocus: function(name) {
    this.elements[name].classList.remove('focus');
  }
});

app.collections.cache = Backbone.Collection.extend({
  model: app.models.school,
  initialize: function(models, options) {
    _.bindAll(this, 'load', '_fetchModels');
    this.names = options.names;
    this.on('add reset get', _.debounce(this._fetchModels, 10));
  },
  load: function(urn) {
    var model = this.get(urn);
    if (!model && (urn in this.names)) {
      this.add({
        _id: urn,
        name: this.names[urn]
      });
      model = this.get(urn);
    }
    this.trigger('get');
    return model;
  },
  _fetchModels: function() {
    var self = this;
    var urns = [];
    var notLoaded = this.filter(function(model) {
      return !model.loaded() && !model.loading;
    });
    notLoaded.forEach(function(model) {
      model.loading = true;
      urns.push(model.id);
    });
    if (urns.length) app.get.byURNs(urns, function(err, schools) {
      if (err) return notLoaded.forEach(function(model) {
        model.loading = false;
      });
      self.set(schools, {remove: false});
    });
  },
  getByURNs: function(urns) {
    if (!urns.length) return [];
    var models = urns.map(this.load);
    return _.compact(models);
  }
});

app.collections.schools = Backbone.Collection.extend({
  model: app.models.school,
  initialize: function() {
    var self = this;
    var debouncedSort = _.debounce(function() {
      if (self.comparator) self.sort();
    }, 10);
    this.on('change', debouncedSort);
    this.listenTo(app.subjects, 'select deselect', debouncedSort);
  },
  addURNs: function(urns) {
    return this.add(app.cache.getByURNs(urns));
  },
  resetURNs: function(urns) {
    return this.reset(app.cache.getByURNs(urns));
  },
  visible: function() {
    return this.toArray();
  }
});

app.collections.results = app.collections.schools.extend({
  initialize: function() {
    this.filters = [];
    app.collections.schools.prototype.initialize.apply(this, arguments);
  },
  visible: function() {
    var models = this.toArray();
    this.filters.forEach(function(filter) {
      models = models.filter(filter);
    });
    return models;
  },
  addFilter: function(filter) {
    if (this.filters.indexOf(filter) === -1) {
      this.filters.push(filter);
      this.trigger('update');
    }
  },
  removeFilter: function(filter) {
    var index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
      this.trigger('update');
    }
  },
});

app.views.schools = Backbone.View.extend({
  initialize: function(options) {
    var self = this;
    this.sorting = new app.views.sorting({
      el: this.$('thead')
    });
    this.compare = options.compare;
    this.results = options.results;
    this.$compare = options.$compare;
    this.$results = options.$results;
    this.listenTo(this.compare, 'reset', this._onReset);
    this.listenTo(this.results, 'reset', this._onReset);
    this.listenTo(this.compare, 'remove', this._onRemove);
    this.listenTo(this.results, 'remove', this._onRemove);
    this.listenTo(this.compare, 'add remove reset sort', this._updateCompare);
    this.listenTo(this.results, 'add remove reset sort update loaded', this._updateResults);
    this.listenTo(this.compare, 'add remove reset update loaded', this._updateSubjectCounts);
    this.listenTo(this.results, 'add remove reset update loaded', this._updateSubjectCounts);
    this.results.addFilter(function(model) {
      return !self.compare.contains(model);
    });
    this.listenTo(app.subjects, 'focus', function() {
      self.el.classList.add('grayscale');
    });
    this.listenTo(app.subjects, 'unfocus', function() {
      self.el.classList.remove('grayscale');
    });
  },
  // adds loading style
  loadingStart: function() {
    this.$results.addClass('loading');
  },
  loadingEnd: function() {
    this.$results.removeClass('loading');
  },
  models: function() {
    return _.union(this.compare.models, this.results.models);
  },
  showDistance: function() {
    this.el.classList.remove('no-distance');
  },
  hideDistance: function() {
    this.el.classList.add('no-distance');
  },
  isEmpty: function() {
    return this.compare.length + this.results.visible().length === 0;
  },
  _updateCompare: function() {
    var elems = [];
    // avoiding $(el).html() as it detaches events
    this.$compare[0].innerHTML = '';
    this.compare.toArray().forEach(function(model) {
      if (!model.view) model.view = new app.views.school({model: model});
      elems.push(model.view.el);
    });
    var fragment = app.utils.arrayToFragment(elems);
    this.$compare.append(fragment);
    this._updateResults();
  },
  _updateResults: function() {
    var elems = [];
    // avoiding $(el).html() as it detaches events
    this.$results[0].innerHTML = '';
    this.results.visible().forEach(function(model) {
      if (!model.view) model.view = new app.views.school({model: model});
      elems.push(model.view.el);
    });
    var fragment = app.utils.arrayToFragment(elems);
    this.$results.append(fragment);
  },
  _onRemove: function(model) {
    this._removeViews([model]);
  },
  _onReset: function(collection, options) {
    var previous = options.previousModels;
    var current = this.models();
    var removed = _.difference(previous, current);
    this._removeViews(removed);
  },
  _removeViews: function(models) {
    models.forEach(function(model) {
      if (model.view) {
        model.view.remove();
        delete model.view;
      }
    });
  },
  _updateSubjectCounts: function() {
    var models = _.union(this.compare.models, this.results.visible());
    models = models.map(function(model) { return model.toJSON(); });
    var counts = app.helpers.getSubjectCounts(models);
    app.subjects.resetCounts(counts);
  }
});