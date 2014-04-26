var reCollege = /college/i;

var schoolTypes = {
  "Private": ["IND"],
  "Public": ["AC", "ACC", "CTC", "CY", "F", "FD", "FSS", "FUTC", "F1619", "VA", "VC"],
  "Special": ["ACCS", "ACS", "CYS", "FDS", "FS", "INDSS", "NMSS", "General Further Education College (Special)"]
};

app.helpers.getSuperType = function(abbr) {
  for (var type in schoolTypes) {
    if (_.contains(schoolTypes[type], abbr)) return type;
  }
  if (reCollege.test(abbr)) return "Public";
  return abbr;
};

app.helpers.getSubjectCounts = function(schools) {
  var counts = {};
  schools.forEach(function(school) {
    try {
      var results = school["performance"][YEAR]["results"]["a-level"];
      for (var name in results) {
        counts[name] = counts[name] ? counts[name] + 1 : 1;
      }
    } catch(err) {}
  });
  return counts;
};

var grades = {
  'A*': 300,
  'A': 270,
  'B': 240,
  'C': 210,
  'D': 180,
  'E': 150
};

var gradeColors = {
  'A*': '#0d8a00',
  'A': '#0d8a00',
  'B': '#51b546',
  'C': '#8a8a8a',
  'D': '#c46e6e',
  'E': '#c10e0e',
};

app.helpers.grade = function(pointScore) {
  for (var grade in grades) {
    if (pointScore < grades[grade] + 15 &&
        pointScore >= grades[grade] - 15) {
      return grade;
    }
  }
};

app.helpers.gradeColor = function(grade) {
  return gradeColors[grade] || gradeColors['E'];
};

app.helpers.buildLegend = function() {
  var $container = $('.grade-legend-container');
  var elements = [];
  var x = app.helpers.apsInterpolate;
  var perc = app.utils.toPercentage;
  for (var grade in grades) {
    if (grade === 'A*') continue;
    var score = grades[grade];
    var color = app.helpers.gradeColor(grade);
    var x0 = x(score+15);
    var x1 = x(score-15);
    var element = $('<div>'+grade+'</div>')
      .addClass('grade-legend-item')
      .css({
        'left': perc(x0),
        'width': perc(x1-x0),
        'border-color': color,
        'color': color
      });
    elements.push(element);
  }
  $container.append(elements);
};

app.helpers.apsInterpolate = app.utils.uninterpolateClamp(app.preload.aps.max, app.preload.aps.min);
