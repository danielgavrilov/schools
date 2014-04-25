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
  if (reCollege.test(abbr)) return "Private";
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

app.helpers.grade = function(pointScore) {
  for (var grade in grades) {
    if (pointScore < grades[grade] + 15 &&
        pointScore >= grades[grade] - 15) {
      return grade;
    }
  }
};

app.helpers.apsInterpolate = app.utils.uninterpolateClamp(app.preload.aps.min, app.preload.aps.max);
