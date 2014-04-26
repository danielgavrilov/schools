this["app"] = this["app"] || {};
this["app"]["templates"] = this["app"]["templates"] || {};

this["app"]["templates"]["grade"] = function(data) {var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }__p += '<div class="bar ' +((__t = ( data.classed )) == null ? '' : __t) +'" style="left: ' +((__t = ( data.left )) == null ? '' : __t) +'; width: ' +((__t = ( data.width )) == null ? '' : __t) +'">\r\n  <span class="grade '; if (data.grade === 'C') print("grade-"+data.classed) ;__p += '">\r\n    ' +((__t = ( data.grade )) == null ? '' : __t) +'\r\n  </span>\r\n</div>';return __p};

this["app"]["templates"]["histogram"] = function(data) {var __t, __p = '', __e = _.escape;__p += '<div class="aps-entry-histogram"><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 96.31068%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 96.50485%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 91.06796%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 75.14563%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 58.05825%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 22.52427%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 0.00000%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 11.45631%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 45.24272%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 62.91262%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 70.87379%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 83.49515%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 90.87379%;"></div></div><div class="wrap" style="width: 7.14286%;"><div class="bar" style="top: 96.89320%;"></div></div></div>';return __p};

this["app"]["templates"]["performance"] = function(data) {var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }__p += '<div data-subject="' +((__t = ( data.name )) == null ? '' : __t) +'" class="subject ' +((__t = ( data.color )) == null ? '' : __t); if (!data["total"]) { ;__p += ' no-entries'; } else if (!data["a-c"]) { ;__p += ' suppressed'; } ;__p += '">\r\n  <em>' +((__t = ( data.name )) == null ? '' : __t) +'</em>\r\n  '; if (data["a-c"] != null) { ;__p += '\r\n  <div style="width: ' +((__t = ( data["a-a"].perc )) == null ? '' : __t) +'" class="a-a">\r\n    <i><span>' +((__t = ( data["a-a"].num )) == null ? '' : __t) +'</span></i>\r\n  </div>\r\n  <div style="width: ' +((__t = ( data["a-c"].perc )) == null ? '' : __t) +'" class="a-c">\r\n    <i><span>' +((__t = ( data["a-c"].num )) == null ? '' : __t) +'</span></i>\r\n  </div>\r\n  <div style="width: ' +((__t = ( data["no-result"].perc )) == null ? '' : __t) +'" class="no-result">\r\n    <span>' +((__t = ( data["no-result"].num )) == null ? '' : __t) +'</span>\r\n  </div>\r\n  '; } ;__p += '\r\n  <div class="entries">' +((__t = ( data.total || 0 )) == null ? '' : __t) +'</div>\r\n</div>';return __p};

this["app"]["templates"]["school"] = function(data) {var __t, __p = '', __e = _.escape, __j = Array.prototype.join;function print() { __p += __j.call(arguments, '') }__p += '<td class="name">\r\n  <div class="relative">\r\n    <div class="attributes">\r\n      '; if (data.gender === "Girls") { ;__p += '\r\n        <div class="tooltip girl">\r\n          <p class="message"><strong>Girls\' school</strong></p>\r\n        </div>\r\n      '; } else if (data.gender === "Boys") { ;__p += ' \r\n        <div class="tooltip boy">\r\n          <p class="message"><strong>Boys\' school</strong></p>\r\n        </div>\r\n      '; } ;__p += '\r\n    </div>\r\n    ' +((__t = ( data.name )) == null ? '' : __t) +'\r\n  </div>\r\n</td>\r\n<td class="performance"></td>\r\n<td class="total-a2">' +((__t = ( data["performance"][YEAR]["students"]["a-level"] )) == null ? '' : __t) +'</td>\r\n<td class="total-subjects">\r\n  <div class="tooltip">\r\n    ' +((__t = ( data["total-subjects"] )) == null ? '' : __t) +'\r\n    '; if (data["total-subjects"] > 0) { ;__p += '\r\n    <div class="all-subjects message '; if (data["total-subjects"] > 45) { print("four") } else if (data["total-subjects"] > 30) { print("three") } else if (data["total-subjects"] > 15) { print("two") } ;__p += '">\r\n      <h3>Number of students per subject</h3>\r\n      <div class="all-subjects-list">\r\n        '; data["subjects"].forEach(function(subject) { ;__p += '\r\n        <div class="all-subjects-entry">\r\n          <i>' +((__t = ( subject.total )) == null ? '' : __t) +'</i>\r\n          <b>' +((__t = ( subject.name )) == null ? '' : __t) +'</b>\r\n        </div>\r\n        '; }); ;__p += '\r\n      </div>\r\n    </div>\r\n    '; } ;__p += '\r\n  </div>\r\n</td>\r\n<td class="aps-entry aps-entry-mean"><div class="aps-entry-content"></div></td>\r\n<td class="type ' +((__t = ( data["supertype"].toLowerCase() )) == null ? '' : __t) +'">' +((__t = ( data["supertype"] )) == null ? '' : __t) +'</td>\r\n<td class="distance"></td>\r\n<td class="compare-col">\r\n  <button class="add-compare" title="Add to compare">+</button>\r\n  <button class="remove-compare" title="Remove from compare">&ndash;</button>\r\n</td>';return __p};

this["app"]["templates"]["subject"] = function(data) {var __t, __p = '', __e = _.escape;__p += '<label><input type="checkbox"> ' +((__t = ( data.name )) == null ? '' : __t) +'</label>';return __p};