module.exports = function(grunt) {

  grunt.initConfig({
    bower: {
      dev: {
        dest: 'vender',
        options: {
          keepExpandedHierarchy: false,
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower');

  grunt.registerTask('default', ['bower']);

};
