var path = require('path');
var _ = require('lodash');

module.exports = function(grunt) {
  var templates = path.resolve(__dirname, '../src/templates');

  grunt.registerMultiTask('ngeni', 'build dgeni based documentation', function() {
    var start = now(),
        done = this.async(),
        options = this.options({
          dest: 'docs/',
          startPage: '/api',
          scripts: ['angular.js'],
          styles: [],
          title: grunt.config('pkg') ?
            (grunt.config('pkg').title || grunt.config('pkg').name) :
            '',
          html5Mode: true,
          editExample: true
        });

    var Dgeni = require('dgeni');
    var that = this;
    var dgeniConf = require(path.resolve(__dirname, '../src/config/dgeni.conf.js'));
    dgeniConf
      .config(function(dgeni, log, readFilesProcessor, writeFilesProcessor) {
        dgeni.stopOnValidationError = true;
        dgeni.stopOnProcessingError = true;

        log.level = 'debug';

        readFilesProcessor.basePath = that.files[0].basePath;
        readFilesProcessor.sourceFiles = _.union(readFilesProcessor.sourceFiles, that.files[0].src);

        writeFilesProcessor.outputFolder = options.dest;

      });

    var dgeni = new Dgeni([dgeniConf]);

    dgeni.generate().then(
      function fulfilled() {
        grunt.log.writeln('DONE. Generated in ' + (now()-start) + 'ms.');
        done();
      },
      function rejected() {
        process.exit(1);
      }
    );

  });


  function now() { return new Date().getTime(); }

 };
