(function() {
  'use strict';
  var Promise = require('bluebird'),
    os = require('os'),
    osenv = require('osenv'),
    path = require('path'),
    fs = require('fs'),
    walkdir = require('walkdir');

  module.exports = function(options) {
    var dotfilesPath = path.join(osenv.home(), 'Dropbox/dotfiles'),
      home = path.join(osenv.home(), '/test-dotfiles'); // osenv.home()

    var hostName = os.hostname().split('.')[0];

    return createLinks(path.join(dotfilesPath, 'local', hostName), options).
      then(function() {
        return createLinks(path.join(dotfilesPath, 'global'), options);
      });

    function log() {
      if (options.verbose || options.dryRun) {
        console.log.apply(console, arguments);
      }
    }

    function createLinks(dotfilesPath) {
      return new Promise(function(resolve) {
        var run = !options.dryRun;

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
              log('Skipping', newPath);
            } else {
              log('Link', newPath, '->', name);
              if (run) {
                fs.symlinkSync(name, newPath);
              }
            }
          });

          emitter.on('end', resolve);
        } else {
          console.log('No dotfiles found in', dotfilesPath, ', skipping');
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
  };
})();
