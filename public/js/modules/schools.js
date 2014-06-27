app.models.school = Backbone.Model.extend({
  idAttribute: '_id',
  defaults: {
    hover: false
  },
  initialize: function() {
    this.listenTo(app.state, 'change:location', this.updateDistance);
    this._parseData();
  },
  getSubject: function(name) {
    try {
      return this.get('performance')[YEAR]['results']['a-level'][name];
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
  _parseData: function() {
    var totalSubjects;
    this.set('supertype', app.helpers.getSuperType(this.get('type')));
    try { totalSubjects = _.keys(this.get('performance')[YEAR]['results']['a-level']).length; } 
    catch(e) { totalSubjects = null }
    this.set('total-subjects', totalSubjects);
  }
});

app.views.school = Backbone.View.extend({
  tagName: 'tr',
  className: 'school',
  template: app.templates.school,
  initialize: function() {
    this.render();
    this.listenTo(this.model, 'change:distance', this.updateDistance);
  },
  events: {
    'mouseenter': '_mouseEnter',
    'mouseleave': '_mouseLeave',
    'click .add-compare': '_addToCompare',
    'click .remove-compare': '_removeFromCompare'
  },
  render: function() {
    var self = this;
    var data = this.model.toJSON();
    var html = this.template(this._processData(data));
    this.$el.html(html);
    this.$distance = this.$('.distance');
    this.$aps = this.$('.aps-entry-content');
    this.renderAPS();
    this.updateDistance();
    this.performance = new app.views.performance({
      el: this.$('td.performance'),
      model: this.model
    });
    this.model.on('change:hover', function(model, hoverValue) {
      self.$el.toggleClass('hover', hoverValue);
    });
  },
  renderAPS: function() {
    try {
      var score = this.model.get('performance')[YEAR]['aps']['a-level']['entry'];
      if (typeof score !== 'number') throw new Error('School does not have score');
      var grade = app.helpers.grade(score) || "U";
      var color = app.helpers.gradeColor(grade);
      var html = app.templates.grade({
        grade: grade,
        color: color,
        width: app.utils.toPercentage(app.helpers.apsInterpolate(score))
      });
      this.$aps.html(html);
    } catch(e) {}
  },
  updateDistance: function() {
    var distance = this.model.get('distance');
    try {
      distance = distance.toFixed(1);
    } catch(e) {}
    this.$distance.html(distance);
  },
  remove: function() {
    if (this.performance) this.performance.remove();
    delete this.performance;
    return Backbone.View.prototype.remove.call(this);
  },
  _mouseEnter: function() {
    this.model.set('hover', true);
  },
  _mouseLeave: function() {
    this.model.set('hover', false);
  },
  _addToCompare: function() {
    app.compare.add(this.model);
  },
  _removeFromCompare: function() {
    app.compare.remove(this.model);
  },
  _processData: function(data) {
    try {
      var subjects = data['performance'][YEAR]['results']['a-level'];
      for (var name in subjects) {
        subjects[name].name = name;
      }
      data['subjects'] = _.sortBy(_.values(subjects), 'total').reverse();
    } catch(e) {}
    return data;
  }
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
    } else {
      this.$el.html('<p>No subjects selected.</p>');
    }
  },
  generateSubject: function(subject) {
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
        'a-a': {
          'num': AtoA || '',
          'perc': toPerc(AtoA/total),
        },
        'a-c': {
          'num': AtoC || '',
          'perc': toPerc(AtoC/total)
        },
        'no-result': {
          'num': NR || '',
          'perc': toPerc(NR/total)
        }
      });
    }
    return subject;
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
  getByURNs: function(urns) {
    var models = _.map(urns, this.get, this);
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
    this.on('change:distance', debouncedSort);
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
    app.collections.schools.prototype.initialize.apply(this, arguments); // ugliness. there's probably a better way.
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
      this.trigger('filter');
    }
  },
  removeFilter: function(filter) {
    var index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
      this.trigger('filter');
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
    this.listenTo(this.results, 'add remove reset sort filter', this._updateResults);
    this.listenTo(this.compare, 'add remove reset filter', this._updateSubjectCounts);
    this.listenTo(this.results, 'add remove reset filter', this._updateSubjectCounts);
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
    this.compare.visible().forEach(function(model) {
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