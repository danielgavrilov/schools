var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    paths: {
      templates: ['public/js/templates/*.tmpl']
    },

    jst: {
      templates: {
        options: {
          namespace: 'app.templates',
          templateSettings: {
            variable: 'data'
          },
          processName: function(filename) {
            return path.basename(filename).split('.')[0];
          },
          prettify: true
        },
        files: {
          'public/js/templates.js': ['<%= paths.templates %>']
        }
      }
    },

    watch: {
      templates: {
        files: '<%= paths.templates %>',
        tasks: ['jst']
      },
      colors: {
        files: 'scripts/colors/*',
        tasks: ['colors']
      }
    }

  });

  grunt.registerTask('colors', 'Generate colors', function() {
    var colors = require('./scripts/colors/colors');
    var template = grunt.file.read('scripts/colors/colors.tmpl');
    var colorNames = colors.map(function(color) { return color.name; });
    var css = grunt.template.process(template, {data: {colors: colors}});
    grunt.file.write('public/css/colors.css', css);
    grunt.file.write('app/preload/colornames.js', JSON.stringify(colorNames));
  });

  grunt.registerTask('schools', 'Generate schools', function() {
    var done = this.async();
    var schools = require('./scripts/schools');
    schools.getNames(function(names) {
      grunt.file.write('app/preload/schoolnames.js', JSON.stringify(names));
      done();
    });
  });

  grunt.registerTask('subjects', 'Generate subjects', function() {
    var done = this.async();
    var subjects = require('./scripts/subjects');
    subjects.getNames(function(names) {
      grunt.file.write('app/preload/subjectnames.js', JSON.stringify(names));
      done();
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['colors', 'schools', 'subjects', 'jst']);

};