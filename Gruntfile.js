module.exports = function(grunt) {

  // load helpers

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // config grunt

  grunt.initConfig({
    exec: {
    },

    // watch for changes

    watch: {
      options: {
        livereload: true
      },

      // if examples change, signal page reload

      scripts: {
        files: ['js/**/*'],
        tasks: [],
      },
    },
  });

  // tasks

  grunt.registerTask('default',     'Watch for changes and trigger \'livereload\'.', ['watch']         );
};
