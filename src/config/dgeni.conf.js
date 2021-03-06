"use strict";

var path = require('canonical-path');
var packagePath = __dirname;

var Package = require('dgeni').Package;

// Create and export a new Dgeni package called ngeni.
module.exports = new Package('ngeni', [
  //includes jsdocs and nunjucks dgeni-packages
  require('dgeni-packages/ngdoc'),
  require('dgeni-packages/examples')
])

  .factory(require('./services/errorNamespaceMap'))
  .factory(require('./services/getMinerrInfo'))
  .factory(require('./services/getVersion'))
  .factory(require('./services/gitData'))

  .factory(require('./services/deployments/debug'))
  .factory(require('./services/deployments/default'))
  .factory(require('./services/deployments/jquery'))
//.factory(require('./services/deployments/production'))

  .factory(require('./inline-tag-defs/type'))

  .processor(require('./processors/error-docs'))
  .processor(require('./processors/index-page'))
  .processor(require('./processors/keywords'))
  .processor(require('./processors/pages-data'))
  .processor(require('./processors/versions-data'))

  .config(function (dgeni, log) {
    dgeni.stopOnValidationError = true;
    dgeni.stopOnProcessingError = true;

    log.info('ngeni package path: %s', packagePath);
  })

  .config(function(log, readFilesProcessor) {
    var packageContent = path.resolve(packagePath, '../content');
    log.info('ngeni packaged content path: %s', packageContent);

    readFilesProcessor.basePath = '.';

    readFilesProcessor.sourceFiles = [{
      basePath: packageContent,
      include: './**/*.ngdoc'
    }];

  })

  .config(function(parseTagsProcessor) {
    parseTagsProcessor.tagDefinitions.push(require('./tag-defs/tutorial-step'));
    parseTagsProcessor.tagDefinitions.push(require('./tag-defs/sortOrder'));
  })

  .config(function(inlineTagProcessor, typeInlineTagDef) {
    inlineTagProcessor.inlineTagDefinitions.push(typeInlineTagDef);
  })

  .config(function(log, templateFinder, renderDocsProcessor, gitData) {
    var packageTemplates = path.resolve(packagePath, 'templates');
    log.info('ngeni packaged templates path: %s', packageTemplates);

    templateFinder.templateFolders.unshift(packageTemplates);
    renderDocsProcessor.extraData.git = gitData;
  })

  .config(function(computePathsProcessor, computeIdsProcessor) {

    computePathsProcessor.pathTemplates.push({
      docTypes: ['error'],
      pathTemplate: 'error/${namespace}/${name}',
      outputPathTemplate: 'partials/error/${namespace}/${name}.html'
    });

    computePathsProcessor.pathTemplates.push({
      docTypes: ['errorNamespace'],
      pathTemplate: 'error/${name}',
      outputPathTemplate: 'partials/error/${name}.html'
    });

    computePathsProcessor.pathTemplates.push({
      docTypes: ['overview', 'tutorial'],
      getPath: function(doc) {
        var docPath = path.dirname(doc.fileInfo.relativePath);
        if (doc.fileInfo.baseName !== 'index') {
          docPath = path.join(docPath, doc.fileInfo.baseName);
        }
        return docPath;
      },
      outputPathTemplate: 'partials/${path}.html'
    });

    computePathsProcessor.pathTemplates.push({
      docTypes: ['e2e-test'],
      getPath: function() {
      },
      outputPathTemplate: 'ptore2e/${example.id}/${deployment.name}_test.js'
    });

    computePathsProcessor.pathTemplates.push({
      docTypes: ['indexPage'],
      getPath: function() {
      },
      outputPathTemplate: '${id}.html'
    });

    computePathsProcessor.pathTemplates.push({
      docTypes: ['module'],
      pathTemplate: '${area}/${name}',
      outputPathTemplate: 'partials/${area}/${name}.html'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: ['componentGroup'],
      pathTemplate: '${area}/${moduleName}/${groupType}',
      outputPathTemplate: 'partials/${area}/${moduleName}/${groupType}.html'
    });

    computeIdsProcessor.idTemplates.push({
      docTypes: ['overview', 'tutorial', 'e2e-test', 'indexPage'],
      getId: function(doc) {
        return doc.fileInfo.baseName;
      },
      getAliases: function(doc) {
        return [doc.id];
      }
    });

    computeIdsProcessor.idTemplates.push({
      docTypes: ['error', 'errorNamespace'],
      getId: function(doc) {
        return 'error:' + doc.name;
      },
      getAliases: function(doc) {
        return [doc.id];
      }
    });

  })
  .config(function(
    generateIndexPagesProcessor,
    generateProtractorTestsProcessor,
    generateExamplesProcessor,
    debugDeployment, defaultDeployment,
    jqueryDeployment, productionDeployment) {

    generateIndexPagesProcessor.deployments = [
      debugDeployment,
      defaultDeployment,
      jqueryDeployment,
      productionDeployment
    ];

    generateProtractorTestsProcessor.deployments = [
      defaultDeployment,
      jqueryDeployment
    ];

    generateExamplesProcessor.deployments = [
      debugDeployment,
      defaultDeployment,
      jqueryDeployment,
      productionDeployment
    ];
  })
;



