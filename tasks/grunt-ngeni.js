var path = require('path');
var _ = require('lodash');

module.exports = function(grunt) {
  var templates = path.resolve(__dirname, '../src/templates');

  grunt.registerMultiTask('ngeni', 'build AngularJS style ngdocs documentation', function() {
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
          editExample: true,
          logLevel: 'info'
        });
    var Dgeni = require('dgeni');
    var that = this;
    try {
      var confPath = path.resolve(__dirname, '../src/config/dgeni.conf');
      var angularDgeniPkg = require(confPath);
    } catch (ex) {
      throw ex;
    }
    angularDgeniPkg
      .config(function(dgeni, log, readFilesProcessor, writeFilesProcessor) {
        dgeni.stopOnValidationError = true;
        dgeni.stopOnProcessingError = true;

        log.level = options.logLevel;
        log.info(log.level);

        log.info(JSON.stringify(that.files, undefined, 2));
        readFilesProcessor.sourceFiles.push(that.files[0].src);



        writeFilesProcessor.outputFolder = options.dest;

      });

    var dgeni = new Dgeni([angularDgeniPkg]);

    dgeni.generate().then(
      function fulfilled() {
        grunt.log.writeln('DONE. Generated in ' + (now()-start) + 'ms.');
        done();
      },
      function rejected(reason) {
        grunt.log.wrintln(JSON.stringify(reason, undefined, 2));
        process.exit(1);
      }
    );

  });


  function now() { return new Date().getTime(); }

 };
