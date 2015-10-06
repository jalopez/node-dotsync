(function() {
  'use strict';
  var Promise = require('bluebird'),
    osenv = require('osenv'),
    path = require('path'),
    fs = require('fs'),
    walkdir = require('walkdir');

  var DOTFILES = path.join(osenv.home(), 'Dropbox/dotfiles/global'),
    HOME = path.join(osenv.home(), '/test-dotfiles'); // osenv.home()

  module.exports = function() {
    return new Promise(function(resolve) {

      var emitter = walkdir(DOTFILES);

      emitter.on('directory', function(name) {
        var newPath = translatePath(name);
        if (!fs.existsSync(newPath)) {
          console.log('Mkdir', newPath);
          fs.mkdirSync(newPath);
        }
      });

      emitter.on('file', function(name) {
        var newPath = translatePath(name);
        console.log('Link', newPath, '->', name);

        if (fs.existsSync(newPath)) {
          fs.unlinkSync(newPath);
        }
        try {
          fs.symlinkSync(name, newPath);
        } catch(e) {
          console.log(e);
        }
      });

      emitter.on('end', resolve);
    });
  };

  function translatePath(filePath) {
    // Translate dotpath structure to home structure
    var translated = path.relative(DOTFILES, filePath);
    translated = path.join(HOME, translated);
    // Change [...]/_name[...] into [...]/.name[...]
    return translated.replace(/\/_/g, '/.');
  }
})();
