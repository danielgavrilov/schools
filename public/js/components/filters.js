app.views.filters = Backbone.View.extend({
  initialize: function() {
    var self = this;
    this.filterElems = {};
    this.$el.find('.filter').each(function(i, elem) {
      var $elem = $(elem)
      var name = $elem.data('filter');
      if (name in self.filters) {
        self.filterElems[name] = elem;
      }
    });
  },
  events: {
    'change .filter': '_onChange'
  },
  filters: {
    'independent': function(model) { return model.get('supertype') !== "Independent" },
    'state-funded': function(model) { return model.get('supertype') !== "State-funded" },
    'special': function(model) { return model.get('supertype') !== "Special" },
    'single-sex': function(model) { 
      var gender = model.get('gender');
      return gender !== "Girls" && gender !== "Boys";
    },
  },
  exclude: function(name) {
    var filter = this.filters[name];
    var elem = this.filterElems[name];
    if (filter) app.results.addFilter(filter);
    if (elem) {
      elem.checked = (name == 'single-sex') ? true : false;
    } 
  },
  include: function(name) {
    var filter = this.filters[name];
    var elem = this.filterElems[name];
    if (filter) app.results.removeFilter(filter);
    if (elem) {
      elem.checked = (name == 'single-sex') ? false : true;
    }  
  },
  _onChange: function(event) {
    var target = event.currentTarget;
    var name = $(target).data('filter');
    if (target.checked) (name == 'single-sex') ? this.exclude(name) : this.include(name);
    else (name == 'single-sex') ? this.include(name) : this.exclude(name);
  }
});
