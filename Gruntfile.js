var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    files: {
      js: [
        'public/js/vendor/jquery.js',
        'public/js/vendor/jquery.stickytableheaders.js',
        'public/js/vendor/underscore.js',
        'public/js/vendor/backbone.js',
        'public/js/vendor/backbone.queryparams-1.1-shim.js',
        'public/js/vendor/backbone.queryparams.js',
        'public/js/namespace.js',
        'public/js/preload.js',
        'public/js/templates.js',
        'public/js/modules/utils.js',
        'public/js/modules/helpers.js',
        'public/js/modules/*.js',
        'public/js/main.js',
      ],
      templates: [
        'public/js/templates/*.tmpl'
      ],
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
          'public/js/templates.js': ['<%= files.templates %>']
        }
      }
    },

    sass: {
      build: {
        options: {
          sourcemap: true,
          style: 'compressed'
        },
        files: {
          'public/build/app.css': 'public/sass/index.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        map: 'public/build/',
      },
      build: {
        src: 'public/build/app.css',
        dest: 'public/build/app.css'
      }
    },

    uglify: {
      build: {
        options: {
          mangle: true,
          compress: true,
          sourceMap: true,
          sourceMapRoot: 'public/',
          preserveComments: 'some',
        },
        files: {
          'public/build/app.js': ['<%= files.js %>']
        }
      }
    },

    watch: {
      templates: {
        files: '<%= files.templates %>',
        tasks: ['jst']
      },
      sass: {
        files: 'public/sass/*.scss',
        tasks: ['css']
      },
      js: {
        files: '<%= files.js %>',
        tasks: ['js']
      },
      colors: {
        files: 'tasks/colors/*',
        tasks: ['colors']
      },
      histogram: {
        files: 'tasks/histogram/*',
        tasks: ['histogram']
      },
      preload: {
        files: 'tasks/preload/*',
        tasks: ['preload']
      }
    }

  });

  grunt.registerTask('colors', 'Generate colors', function() {
    var colors = require('./tasks/colors/colors');
    var template = grunt.file.read('tasks/colors/colors.tmpl');
    var colorNames = colors.map(function(color) { return color.name; });
    var css = grunt.template.process(template, {data: {colors: colors}});
    grunt.file.write('public/sass/colors.scss', css);
    grunt.file.write('tasks/preload/colornames.js', JSON.stringify(colorNames));
  });

  grunt.registerTask('schools', 'Generate schools', function() {
    var done = this.async();
    var schools = require('./tasks/schools');
    schools.getNames(function(names) {
      grunt.file.write('tasks/preload/schoolnames.js', JSON.stringify(names));
      done();
    });
  });

  grunt.registerTask('subjects', 'Generate subjects', function() {
    var done = this.async();
    var subjects = require('./tasks/subjects');
    subjects.getNames(function(names) {
      grunt.file.write('tasks/preload/subjectnames.js', JSON.stringify(names));
      done();
    });
  });

  grunt.registerTask('histogram', 'Generate APS entry histogram', function() {
    var done = this.async();
    var histogram = require('./tasks/histogram');
    histogram(function(data) {
      grunt.file.write('tasks/preload/aps.js', JSON.stringify(data.measures));
      grunt.file.write('public/js/templates/histogram.tmpl', data.html);
      grunt.file.write('public/sass/aps.scss', data.css);
      done();
    });
  });

  grunt.registerTask('preload', 'Generate preload.js', function() {
    var preload = {
      colornames: grunt.file.read('tasks/preload/colornames.js'),
      subjectnames: grunt.file.read('tasks/preload/subjectnames.js'),
      schoolnames: grunt.file.read('tasks/preload/schoolnames.js'),
      aps: grunt.file.read('tasks/preload/aps.js')
    };
    var template = grunt.file.read('tasks/preload/preload.tmpl');
    var content = grunt.template.process(template, {data: preload});
    grunt.file.write('public/js/preload.js', content);
  });

  grunt.registerTask('cleanmap', 'Replace double backslash with forward slash (Windows bug).', function() {
    var path = 'public/build/app.map';
    var content = grunt.file.read(path);
    content = content.replace(/\\{2}/g,'/');
    grunt.file.write(path, content);
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('css', ['sass', 'autoprefixer']);
  grunt.registerTask('js', ['uglify', 'cleanmap']);
  grunt.registerTask('generate', ['colors', 'schools', 'subjects', 'preload']);
  grunt.registerTask('default', ['generate', 'css', 'jst', 'js']);

};