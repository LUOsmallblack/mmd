module.exports = function(grunt) {

  grunt.initConfig({
    bower: {
      dev: {
        dest: 'vender',
        options: {
          keepExpandedHierarchy: false,
          ignorePackages: ['angular', 'jquery-ui', 'dexie'],
          packageSpecific: {
            bootstrap: {
              files: [
                'dist/css/bootstrap-theme.css',
                'dist/css/bootstrap.css',
                'dist/js/bootstrap.js'
              ]
            },
            'js-codepage': {
              files: [
                'dist/cptable.full.js'
              ]
            }
          }
        }
      },
      player: {
        dest: 'player/vender',
        js_dest: 'player/js/',
        css_dest: 'player/css/',
        fonts_dest: 'player/fonts/',
        images_dest: 'player/images/',
        options: {
          keepExpandedHierarchy: false,
          ignorePackages: ['js-codepage', 'lru-cache'],
          packageSpecific: {
            bootstrap: {
              files: [
                'dist/css/bootstrap-theme.min.css',
                'dist/css/bootstrap-theme.css.map',
                'dist/css/bootstrap.min.css',
                'dist/css/bootstrap.css.map',
                'dist/js/bootstrap.min.js',
                'fonts/*'
              ]
            },
            jquery: {
              files: [
                'dist/jquery.min.js',
                'dist/jquery.min.map'
              ]
            },
            'jquery-ui': {
              files: [
                'jquery-ui.min.js'
              ]
            },
            angular: {
              files: [
                'angular.min.js',
                'angular.min.js.map'
              ]
            },
            dexie: {
              files: [
                'dist/latest/Dexie.min.js',
                'dist/latest/Dexie.min.js.map'
              ]
            }
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower');

  grunt.registerTask('default', ['bower:dev', 'bower:player']);

};
