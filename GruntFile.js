/*!
 * Cribbb Gruntfile
 * http://cribbb.com
 * @author Philip Brown
 */

'use strict';

/**
 * Grunt Module
 */
module.exports = function(grunt) {
  
  /**
   * Configuration
   */

  grunt.initConfig({
    /**
     * Get package meta data
     */

    pkg: grunt.file.readJSON('package.json'),

    /**
     * Set project object
     */

    project: {
      app: '',
      assets: '<%= project.app %>',
      src: '<%= project.assets %>',
      css: [
        '<%= project.src %>scss/style.scss'
      ],
      js: [
        '<%= project.src %>/js/*.js'
      ]
    },

    /**
     * Project banner
     */

    tag: {
      banner: '/*!\n' +
        ' * <%= pkg.name %>\n' +
        ' * <%= pkg.title %>\n' +
        ' * <%= pkg.url %>\n' +
        ' * @author <%= pkg.author %>\n' +
        ' * @version <%= pkg.version %>\n' +
        ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
        ' */\n'
    },

    /**
     * Sass
     */

    sass: {
      dev: {
        options: {
          style: 'expanded',
          banner: '<%= tag.banner %>',
          compass: true
        },
        files: {
          '<%= project.assets %>css/style.css': '<%= project.css %>'
        }
      },
      dist: {
        options: {
          style: 'compressed',
          compass: true
        },
        files: {
          '<%= project.assets %>css/style.css': '<%= project.css %>'
        }
      }
    },

    /**
     * Watch
     */

    watch: {
      sass: {
        files: '<%= project.src %>scss/{,*/}*.{scss,sass}',
        tasks: ['sass:dev']
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  /**
   * Load Grunt plugins
   */

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * Default task
   * Run `grunt` on the command line
   */

  grunt.registerTask('default', [
    'sass:dev',
    'watch'
  ]);
};

