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
    const deepEqual = require('./deep-equal');
    // use node-watch
    const watch = require('./watch');
    const watcher = watch('./Meme-of-LinOnetwo/tiddlers', { recursive: true, delay: 500 }, listener);

    /**
     * $tw.boot.files: {
     *   [tiddlerTitle: string]: {
     *     filepath: '/Users/linonetwo/xxxx/wiki/Meme-of-LinOnetwo/tiddlers/tiddlerTitle.tid',
     *     type: 'application/x-tiddler',
     *     hasMetaFile: false
     *   }
     * }
     */
    const initialLoadedFiles = $tw.boot.files;

    /**
     * we can use this for getTitleByPath
     * {
     *   [filepath: string]: {
     *     filepath: '/Users/linonetwo/xxxx/wiki/Meme-of-LinOnetwo/tiddlers/tiddlerTitle.tid',
     *     tiddlerTitle: string,
     *     type: 'application/x-tiddler',
     *     hasMetaFile: false
     *   }
     * }
     */
    const inverseFilesIndex = {};
    // initialize the inverse index
    for (const tiddlerTitle in initialLoadedFiles) {
      const fileDescriptor = initialLoadedFiles[tiddlerTitle];
      inverseFilesIndex[fileDescriptor.filepath] = { ...fileDescriptor, tiddlerTitle };
    }

    const updateInverseIndex = (filePath, fileDescriptor) => {
      inverseFilesIndex[filePath] = fileDescriptor;
    };

    const filePathExistsInWiki = (filePath) => !!inverseFilesIndex[filePath];
    const getTitleByPath = (filePath) => {
      try {
        return inverseFilesIndex[filePath].tiddlerTitle;
      } catch (error) {
        // fatal error, shutting down.
        watcher.close();
        throw new Error(`${filePath}\n↑ not existed in watch-fs plugin's FileSystemMonitor's inverseFilesIndex`);
      }
    };

    /**
     * This watches for changes to a folder and updates the wiki when anything changes in the folder.
     *
     * The filePath reported by listener is not the actual tiddler name, and all tiddlywiki operations requires that we have the name of tiddler,
     * So we have get tiddler name by path from `$tw.boot.files`.
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
        // get tiddler from the disk
        /**
         * tiddlersDescriptor:
         * {
         *    "filepath": "Meme-of-LinOnetwo/tiddlers/$__StoryList.tid",
         *    "type": "application/x-tiddler",
         *    "tiddlers": [
         *      {
         *        "title": "$:/StoryList",
         *        "list": "Index"
         *      }
         *    ],
         *    "hasMetaFile": false
         *  }
         */
        const [tiddlersDescriptor] = $tw.loadTiddlersFromPath(filePath);
        const { tiddlers, ...fileDescriptor } = tiddlersDescriptor;
        // if user is using git or VSCode to create new file in the disk, that is not yet exist in the wiki
        if (!filePathExistsInWiki(filePath)) {
          tiddlers.forEach((tiddler) => {
            updateInverseIndex(filePath, { ...fileDescriptor, tiddlerTitle: tiddler.title });
            $tw.syncadaptor.wiki.addTiddler(tiddler);
          });
        } else {
          // if it already existed in the wiki, this change might due to our last call to `$tw.syncadaptor.wiki.addTiddler`,
          // so we have to check whether tiddler in the disk is identical to the one in the wiki, if so, we ignore it.
          tiddlers
            .filter((tiddler) => {
              const { fields: tiddlerInWiki } = $tw.syncadaptor.wiki.getTiddler(tiddler.title);
              // console.warn(`tiddler`, tiddler);
              // console.warn(`tiddlerInWiki`, tiddlerInWiki);
              // console.log('deepEqual(tiddler, tiddlerInWiki)', deepEqual(tiddler, tiddlerInWiki))
              return !deepEqual(tiddler, tiddlerInWiki);
            })
            // then we update wiki with each newly created tiddler
            .forEach((tiddler) => {
              $tw.syncadaptor.wiki.addTiddler(tiddler);
            });
        }
        const tiddlerTitle = getTitleByPath(filePath);
      }

      // on delete
      if (event == 'remove') {
        const tiddlerTitle = getTitleByPath(filePath);
        console.log(tiddlerTitle);
      }
    }
  }
}
FileSystemMonitor();
