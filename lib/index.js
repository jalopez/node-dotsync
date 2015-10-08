(function() {
  'use strict';
  var Promise = require('bluebird'),
    os = require('os'),
    osenv = require('osenv'),
    path = require('flavored-path'),
    fs = require('fs'),
    walkdir = require('walkdir');

  module.exports = function(options) {
    var dotfilesPath = (options.dotfiles && options.dotfiles !== true) ?
        path.resolve(options.dotfiles) :
        path.join(osenv.home(), 'Dropbox/dotfiles'),

      home = (options.home && options.home !== true) ?
        path.resolve(options.home) :
        osenv.home();

    var hostName = os.hostname().split('.')[0];

    if (!fs.existsSync(home)) {
      fs.mkdirSync(home);
    }

    function log() {
      if (options.verbose || options.dryRun) {
        console.log.apply(console, arguments);
      }
    }

    function createLinks(dotfilesPath) {
      return new Promise(function(resolve) {
        var run = !options.dryRun,
          force = options.force && run;

        if (fs.existsSync(dotfilesPath)) {
          console.log('Linking config from', dotfilesPath);
          var emitter = walkdir(dotfilesPath);

          emitter.on('directory', function(name) {
            var newPath = translatePath(name, dotfilesPath);

            if (!fs.existsSync(newPath)) {
              log('Mkdir', newPath);
              if (run) {
                fs.mkdirSync(newPath);
              }
            }
          });

          emitter.on('file', function(name) {
            if (path.basename(name).indexOf('.') === 0) {
              log('Ignoring', name);
              return;
            }
            var newPath = translatePath(name, dotfilesPath);

            if (fs.existsSync(newPath)) {
              if (force) {
                log('Deleting', newPath);
                fs.unlinkSync(newPath);
              } else {
                log('Skipping', newPath);
                return;
              }
            }
            log('Link', newPath, '->', name);
            if (run) {
              fs.symlinkSync(name, newPath);
            }

          });

          emitter.on('end', resolve);
        } else {
          console.log('No dotfiles found in', dotfilesPath, ', skipping');
          resolve();
        }
      });
    }

    function translatePath(filePath, dotfilesPath) {
      // Translate dotpath structure to home structure
      var translated = path.relative(dotfilesPath, filePath);
      translated = path.join(home, translated);
      // Change [...]/_name[...] into [...]/.name[...]
      return translated.replace(/\/_/g, '/.');
    }

  return createLinks(path.join(dotfilesPath, 'local', hostName), options).
      then(function() {
        return createLinks(path.join(dotfilesPath, 'global'), options);
      });
  };
})();
