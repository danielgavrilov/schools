// (function(undefined) {

var $body = $(document.body);

if ('geolocation' in navigator) {
  $body.addClass('geolocation');
}

// scrolling performance problems
// $('.schools').find('table').stickyTableHeaders();

// Colors
app.colors = new app.constructors.colors(app.preload.colornames);

// Schools
app.cache = new app.collections.schools(null, {
  names: app.preload.schoolnames
});

app.search = new app.views.search({
  el: $('.search-form')
});

// Subjects
app.subjects = new app.collections.subjects(app.preload.subjectnames.sort().map(function(name) {
  return {name: name};
}));
app.subjects.view = new app.views.subjects({
  el: $('.subjects-filter'),
  collection: app.subjects
});

// Results
app.compare = new app.collections.URNList;
app.results = new app.collections.results;

// Global school view (results + compare)
app.schools = new app.views.schools({
  el: $('.schools'),
  compare: app.compare,
  $compare: $('.compare'),
  results: app.results,
  $results: $('.results')
});

Backbone.history.start({pushState: true});

// search();


// })();