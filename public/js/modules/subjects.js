app.models.subject = Backbone.Model.extend({
  defaults: {
    name: null,
    selected: false,
    color: null,
    count: 0,
    focused: false
  },
  initialize: function() {
    this.on('change:selected', function() {
      var evt = this.get('selected') ? 'select' : 'deselect';
      this.trigger(evt); 
    });
    this.on('change:focused', function() {
      var evt = this.get('focused') ? 'focus' : 'unfocus';
      this.trigger(evt, this.get('name')); 
    });
    this.view = new app.views.subject({model: this});
  },
  select: function() {
    var color = app.colors.getLeastUsed();
    app.colors.increase(color);
    this.set({
      selected: true,
      color: color,
      _order: app.utils.incrementor()
    });
    return this;
  },
  deselect: function() {
    var color = this.get('color');
    app.colors.decrease(color);
    this.set({
      selected: false,
      color: null
    });
    return this;
  },
  focus: function() {
    if (this.get('selected')) this.set('focused', true); 
  },
  unfocus: function() {
    this.set('focused', false);
  }
});


app.views.subject = Backbone.View.extend({
  template: app.templates.subject,
  initialize: function() {
    _.bindAll(this, '_mouseenter', '_mouseleave');
    this.listenTo(this.model, 'select', this.select);
    this.listenTo(this.model, 'deselect', this.deselect);
    this.listenTo(this.model, 'change:count', this.updateCount);
    this.render();
  },
  events: {
    'change': '_onChange',
    'mouseenter': '_mouseenter',
    'mouseleave': '_mouseleave'
  },
  render: function() {
    var html = this.template(this.model.toJSON());
    this.setElement(html);
    this.$checkbox = this.$('input[type=checkbox]');
    this.$count = this.$('i');
    this.updateCount();
    return this;
  },
  select: function() {
    this.$el.addClass(this.model.get('color'))
            .addClass('selected');
    this.$checkbox.prop('checked', true);
    return this;
  },
  deselect: function() {
    this.$el.removeClass(this.model.previous('color'))
            .removeClass('selected');
    this.$checkbox.prop('checked', false);
    return this;
  },
  updateCount: function() {
    var count = this.model.get('count');
    if (count < 1) this.$el.addClass('zero');
    else this.$el.removeClass('zero');
    this.$count.html(count);
    return this;
  },
  _onChange: function(event) {
    event.target.checked ? this.model.select() : this.model.deselect();
  },
  _mouseenter: function(event) {
    this.model.focus();
  },
  _mouseleave: function(event) {
    this.model.unfocus();
  },
});


app.collections.subjects = Backbone.Collection.extend({
  model: app.models.subject,
  initialize: function() {
    var self = this;
    // introducing 'selection' event, for batching 'select' events
    this.on('select deselect', _.debounce(function() {
      self.trigger('selection');
    }, 10));
  },
  resetCounts: function(counts) {
    this.each(function(subject) {
      var name = subject.get('name');
      if (name in counts) subject.set('count', counts[name]);
      else subject.set('count', 0);
    });
    this.trigger('counts');
  },
  getByName: function(name) {
    return this.findWhere({name: name});
  },
  selectByName: function(name) {
    this.getByName(name).select();
  },
  selected: function() {
    var selected = this.where({selected: true});
    selected = _.sortBy(selected, function(model) {
      return model.get('_order');
    });
    return selected;
  },
  focused: function() {
    return this.findWhere({focused: true});
  },
  search: function(query) {
    query = query.toLowerCase();
    return this.filter(function(model) {
      var name = model.get('name').toLowerCase();
      return name.indexOf(query) > -1;
    });
  },
  visible: function() {
    var visible = this.filter(function(model) {
      return model.get('count') > 0 || model.get('selected');
    });
    if (visible.length > 25) return this._hideUnpopular(visible);
    else return visible;
  },
  _hideUnpopular: function(models) {
    var softLimit = 20;
    var grouped = _.groupBy(models, function(model) { return model.get('count'); });
    for (var i = 1; i < 10; i++) {
      var length = grouped[i] && grouped[i].length;
      if (length) {
        if (models.length - length > softLimit) {
          var unselected = grouped[i].filter(function(model) {
            return !model.get('selected');
          });
          models = _.difference(models, unselected);
        } else {
          break;
        }
      }
    }
    return models;
  }
});

app.views.subjects = Backbone.View.extend({
  initialize: function(options) {
    this.query = '';
    this.collection = options.collection;
    this.$subjects = this.$('.subjects');
    this.$searchInput = this.$('.search-subjects');
    this.listenTo(this.collection, 'counts', this.render);
    this.render();
  },
  events: {
    'input .search-subjects': '_onInput',
    'submit': '_onSubmit'
  },
  render: function() {
    var models;
    if (this.query.length) {
      models = this.collection.search(this.query);
    } else {
      models = this.collection.visible();
    }
    this._populate(models);
  },
  search: function(query) {
    this.query = query.trim();
    this.render();
  },
  _populate: function(models) {
    this.$subjects[0].innerHTML = '';
    var elems = models.map(function(model) {
      return model.view.el;
    });
    var fragment = app.utils.arrayToFragment(elems);
    this.$subjects.append(fragment);
  },
  _onInput: function(event) {
    this.search(this.$searchInput.val());
  },
  _onSubmit: function(event) {
    this.search(this.$searchInput.blur().val());
    event.preventDefault();
  }
});