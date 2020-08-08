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

  const path = require('path');
  // this allow us to test this module in nodejs directly without "ReferenceError: $tw is not defined"
  var $tw = this.$tw || { node: true };
  // folder to watch
  const watchPathBase = path.resolve('./Meme-of-LinOnetwo/tiddlers');
  // non-tiddler files that needs to be ignored
  const isNonTiddlerFiles = (filePath) => filePath.endsWith('.DS_Store');

  if ($tw.node && !($tw?.settings?.disableFileWatchers === 'yes')) {
    const deepEqual = require('./deep-equal');
    const { generateTiddlerBaseFilepath } = require('./utils');
    const fs = require('fs');
    // use node-watch
    const watch = require('./watch');
    const watcher = watch(watchPathBase, { recursive: true, delay: 500 }, listener);

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
      const fileRelativePath = path.relative(watchPathBase, fileDescriptor.filepath);
      inverseFilesIndex[fileRelativePath] = { ...fileDescriptor, filepath: fileRelativePath, tiddlerTitle };
    }
    fs.writeFileSync('/Users/linonetwo/Desktop/repo/wiki/aaa.json', JSON.stringify(inverseFilesIndex, undefined, '  '));

    // Helpers to maintain our cached index for file path and tiddler title
    const updateInverseIndex = (filePath, fileDescriptor) => {
      if (fileDescriptor) {
        inverseFilesIndex[filePath] = fileDescriptor;
      } else {
        delete inverseFilesIndex[filePath];
      }
    };
    const filePathExistsInIndex = (filePath) => !!inverseFilesIndex[filePath];
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
     * This is a rarely used function maybe only when user rename a tiddler on the disk,
     * we need to get old tiddler path by its name
     * @param {string} title
     */
    const getPathByTitle = (title) => {
      try {
        for (const filePath in inverseFilesIndex) {
          if (inverseFilesIndex[filePath].title === title || inverseFilesIndex[filePath].title === `${title}.tid`) {
            return filePath;
          }
        }
        throw new Error();
      } catch (error) {
        // fatal error, shutting down.
        watcher.close();
        throw new Error(`${title}\n↑ not existed in watch-fs plugin's FileSystemMonitor's inverseFilesIndex`);
      }
    };

    /**
     * A mutex to ignore temporary file created or deleted by this plugin.
     *
     * Set<filePath: string>
     */
    const lockedFiles = new Set();

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
     * @param {"update" | "remove"} changeType
     * @param {*} filePath changed file's relative path to the folder executing this watcher
     */
    function listener(changeType, filePath) {
      const fileRelativePath = path.relative(watchPathBase, filePath);
      const fileAbsolutePath = path.join(watchPathBase, fileRelativePath);
      console.log(`${fileRelativePath} ${changeType}`);
      // ignore some cases
      if (isNonTiddlerFiles(fileRelativePath)) return;
      if (lockedFiles.has(fileRelativePath)) {
        // release lock as we have already finished our job
        return lockedFiles.delete(fileRelativePath);
      }
      // on create or modify
      if (changeType === 'update') {
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
        const [tiddlersDescriptor] = $tw.loadTiddlersFromPath(fileAbsolutePath);
        console.warn(`tiddlersDescriptor`, JSON.stringify(tiddlersDescriptor, null, '  '));
        const { tiddlers, ...fileDescriptor } = tiddlersDescriptor;
        // if user is using git or VSCode to create new file in the disk, that is not yet exist in the wiki
        // but maybe our index is not updated
        if (!filePathExistsInIndex(fileRelativePath)) {
          tiddlers.forEach((tiddler) => {
            // check whether we are rename an existed tiddler
            console.log('getting tiddler.title', tiddler.title);
            const existedWikiRecord = $tw.syncadaptor.wiki.getTiddler(tiddler.title);
            if (existedWikiRecord && deepEqual(tiddler, existedWikiRecord.fields)) {
              // because disk file and wiki tiddler is identical, so this file creation is triggered by wiki
              // we just update the index
              updateInverseIndex(fileRelativePath, { ...fileDescriptor, tiddlerTitle: tiddler.title });
            } else {
              updateInverseIndex(fileRelativePath, { ...fileDescriptor, tiddlerTitle: tiddler.title });
              $tw.syncadaptor.wiki.addTiddler(tiddler);
            }
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
      }

      // on delete
      if (changeType === 'remove') {
        console.log('handle remove', fileRelativePath);
        const tiddlerTitle = getTitleByPath(fileRelativePath);

        // if this tiddler is not existed in the wiki, this means this deletion is triggered by wiki
        // we only react on event that triggered by the git or VSCode
        const existedTiddlerResult = $tw.syncadaptor.wiki.getTiddler(tiddlerTitle);
        if (!existedTiddlerResult) {
          updateInverseIndex(fileRelativePath);
          return;
        } else {
          // now event is triggered by the git or VSCode
          // ask tiddlywiki to delete the file, we first need to create a fake file for it to delete
          // can't directly use $tw.wiki.syncadaptor.deleteTiddler(tiddlerTitle);  because it will try to modify fs, and will failed:
          /* Sync error while processing delete of 'blabla': Error: ENOENT: no such file or directory, unlink '/Users//Desktop/repo/wiki/Meme-of-LinOnetwo/tiddlers/blabla.tid'
          syncer-server-filesystem: Dispatching 'delete' task: blabla 
          Sync error while processing delete of 'blabla': Error: ENOENT: no such file or directory, unlink '/Users//Desktop/repo/wiki/Meme-of-LinOnetwo/tiddlers/blabla.tid' */
          lockedFiles.add(fileRelativePath);
          fs.writeFile(fileAbsolutePath, '', {}, () => {
            $tw.syncadaptor.wiki.deleteTiddler(tiddlerTitle, (error) => console.error(error));
            updateInverseIndex(fileRelativePath);
          });
        }
      }
    }
  }
}
FileSystemMonitor();
