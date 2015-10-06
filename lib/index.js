(function() {
  'use strict';
  var Promise = require('bluebird'),
    os = require('os'),
    osenv = require('osenv'),
    path = require('path'),
    fs = require('fs'),
    walkdir = require('walkdir');

  var DOTFILES = path.join(osenv.home(), 'Dropbox/dotfiles'),
    HOME = path.join(osenv.home(), '/test-dotfiles'); // osenv.home()

  module.exports = function() {
    var hostName = os.hostname();

    return createLinks(path.join(DOTFILES, 'local', hostName)).
      then(function() {
        return createLinks(path.join(DOTFILES, 'global'));
      });
  };

  function createLinks(dotfilesPath) {
    return new Promise(function(resolve) {

      if (fs.existsSync(dotfilesPath)) {
        console.log('Linking config from', dotfilesPath);
        var emitter = walkdir(dotfilesPath);

        emitter.on('directory', function(name) {
          var newPath = translatePath(name, dotfilesPath);

          if (!fs.existsSync(newPath)) {
            console.log('Mkdir', newPath);
            fs.mkdirSync(newPath);
          }
        });

        emitter.on('file', function(name) {
          if (path.basename(name).indexOf('.') === 0) {
            console.log('Ignoring', name);
            return;
          }
          var newPath = translatePath(name, dotfilesPath);

          if (fs.existsSync(newPath)) {
            console.log('Skipping', newPath);
          } else {
            console.log('Link', newPath, '->', name);
            fs.symlinkSync(name, newPath);
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
    translated = path.join(HOME, translated);
    // Change [...]/_name[...] into [...]/.name[...]
    return translated.replace(/\/_/g, '/.');
  }
})();
