/*\
  title: $:/plugins/linonetwo/watch-fs/FileSystemMonitor.js
  type: application/javascript
  module-type: startup

  !! About

  This module watches the file system in the tiddlers folder and any changes to
  the files in the folder that don't come from the browser are reported to the
  browser. So if you make a new .tid file in the tiddlers folder it will appear
  in the wiki in the browser without needing to restart the server. You can also
  delete files to remove the tiddlers from the browser.

  !! How to decide whether a change is comes from the browser?

  We will compare disk file and wiki file, if there is any discrepancy,
  then the change is not made by the wiki, it is made by git or VSCode.

  This file is modified based on $:/plugins/OokTech/Bob/FileSystemMonitor.js
\*/

function FileSystemMonitor() {
  exports.name = 'FileSystemMonitor';
  exports.after = ['load-modules'];
  exports.platforms = ['node'];
  exports.synchronous = true;

  // this allow us to test this module in nodejs directly without "ReferenceError: $tw is not defined"
  var $tw = this.$tw || { node: true };

  if ($tw.node && !($tw?.settings?.disableFileWatchers === 'yes')) {
    const watch = require('./watch');

    watch('./Meme-of-LinOnetwo/tiddlers', { recursive: true, delay: 500 }, listener);
    /**
     * This watches for changes to a folder and updates the wiki when anything changes in the folder.
     * 
     * The filePath reported by listener is not the actual tiddler name, and all tiddlywiki operations requires that we have the name of tiddler,
     * So we have get tiddler name by path somehow.
     * And even worser, if tiddler is deleted, we can't get this mapping form the $tw, so we have to store this information by ourself.
     * 
     * Then we can perform following logic:
     * File update -> update or create tiddler using `$tw.syncadaptor.wiki.addTiddler`
     * File remove & tiddler exist in wiki -> then remove tiddler using `$tw.syncadaptor.wiki.deleteTiddler`
     * File remove & tiddler not exist in wiki -> This change is caused by tiddlywiki itself, do noting here
     * 
     * @param {"update" | "remove"} event
     * @param {*} filePath changed file's relative path to the folder executing this watcher
     */
    function listener(event, filePath) {
      console.log('%s changed.', filePath, event);
      // on create or modify
      if (event == 'update') {
      }

      // on delete
      if (event == 'remove') {
      }
    }
  }
}
FileSystemMonitor();
