# dotsync
Small tool to keep your dotfiles synced across computers.

The tool symlinks your dotfiles from some folder in your system into your `$HOME`.

You can store your dotfiles in your Dropbox (or Github) and automatically use them in all your computers.
It allows to have both global config files and per host config fles. 

## Installation
```
 $ npm install -g dotsync
```
## Usage
```
$ dotsync -h
Usage: dotsync [options]

  Keep your dotfiles synced across computers

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -v, --verbose      Verbose mode
    -d, --dry-run      Dry run
    -f, --force        Force link (will delete contents)
    --dotfiles [path]  Path in which dotfiles are stored [~/Dropbox/dotfiles]
    --home [path]      Path of your home to link your dotfles [~]
```
## Dotfiles structure
Your base dotfiles folder (by default `~/Dropbox/dotfiles`) has to follow a particular structure in order
to allow global/local configurations.

You have to put all your global config inside a `global` folder. If you want to override some config file in an specific
computer, you can have a `local/<hostname>` folder in which you can put all the config files that want to override.
Note that this is optional and you have only to put in that folder the modified files. You can add files that are not
present in the global config as well.

Disclaimer: Dropbox does not sync hidden files (the ones started by dots), so to make everything work, 
you should store your files or folders starting with ´.´ changing it with ´_´. 
In this first version, files starting with dots are ignored (will be fixed in next versions).

### Dofiles example structure
```
~/Dropbox/dotfiles
     └─── global
     |      | _zshrc
     |      | _vimrc
     |      |
     |      └───_vim
     |           |  filetype.vim
     |           |
     |           └─── colors
     |                  solarized.vim
     └─── local
            └─── iMac
            |      |  _vimrc
            |      |  _zshrc_local
            |      |
            |      └───_vim
            |            |  filetype.vim
            |
            └─── job-laptop
                  |  _zshrc
            
```

When running `dotsync` for the first time in `iMac` computer, it will link these files:

```
$ bin/dotsync -v
Linking config from ~/Dropbox/dotfiles/local/iMac
Mkdir ~/.vim
Link ~/.vimrc -> ~/Dropbox/dotfiles/local/iMac/_vimrc
Link ~/.zshrc_local -> ~/Dropbox/dotfiles/local/iMac/_zshrc_local
Link ~/.vim/filetype.vim -> ~/Dropbox/dotfiles/local/iMac/_vim/filetype.vim
Linking config from ~/Dropbox/dotfiles/global
Skipping ~/.vimrc
Link ~/.zshrc -> ~/Dropbox/dotfiles/global/_zshrc
Mkdir ~/.vim/colors
Skipping ~/.vim/filetype.vim
Link ~/.vim/colors/solarized.vim -> ~/Dropbox/dotfiles/global/_vim/colors/solarized.vim
```

## Acknowledge
This tool is ~~copied~~ highly inspired by [sortega's dotfiles](https://github.com/sortega/dotfiles). Kudos to him

## Changelog
 * v.0.0.1 Initial version
 
## TODO
 * Allow to remove broken (old) symlinks
 * Allow to ignore files when syncing
 * Further integration with git-based dotfiles: clone, update, etc. just from the tool
 * Store dotsync user configuration in .dotsyncrc file to avoid setting parameters always
 * dotsync-importer: import your current local dotfiles into a dotsync-compliant folder/file structure 

