var reCollege = /college/i;

var schoolTypes = {
  "Independent": ["IND"],
  "State-funded": ["AC", "ACC", "CTC", "CY", "F", "FD", "FSS", "FUTC", "F1619", "VA", "VC"],
  "Special": ["ACCS", "ACS", "CYS", "FDS", "FS", "INDSS", "NMSS", "General Further Education College (Special)"]
};

app.helpers.getSuperType = function(abbr) {
  for (var type in schoolTypes) {
    if (_.contains(schoolTypes[type], abbr)) return type;
  }
  if (reCollege.test(abbr)) return "State-funded";
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

