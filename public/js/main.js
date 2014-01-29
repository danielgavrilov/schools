app.colors = new app.constructors.colors(app.preload.colornames);
app.cache = new app.collections.cache(null, {
  names: app.preload.schoolnames
});
app.subjects = new app.collections.subjects(app.preload.subjectnames.sort().map(function(name) {
  return {name: name};
}));
app.compare = new app.collections.schools;
app.results = new app.collections.results;

// We need the DOM for the next operations.

$(function() {

  var $body = $(document.body);

  if ('geolocation' in navigator) {
    $body.addClass('geolocation');
  }

  // scrolling performance problems
  // $('.schools').find('table').stickyTableHeaders();

  app.search = new app.views.search({
    el: $('.search-form')
  });
  app.subjects.view = new app.views.subjects({
    el: $('.subjects-filter'),
    collection: app.subjects
  });
  app.schools = new app.views.schools({
    el: $('.schools'),
    compare: app.compare,
    $compare: $('.compare'),
    results: app.results,
    $results: $('.results')
  });
  
  app.router = new app.routers.main;

  Backbone.history.start({pushState: true});

});