const fs = require('fs');
const path = require('path');
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();
const execSync = require('child_process').execSync;

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;
const COMMIT_INTERVAL = 1000 * 3600 / 4;

const projectFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(projectFolder, wikiFolderName);
const commitScriptPath = path.resolve(projectFolder, 'scripts', 'commit.sh');
const syncScriptPath = path.resolve(projectFolder, 'scripts', 'sync.sh');
const frequentlyChangedFileThatShouldBeIgnoredFromWatch = [
  'output',
  'tiddlers/$__StoryList.tid',
  'tiddlers/$__plugins_felixhayashi_tiddlymap_misc_defaultViewHolder.tid',
];

$tw.boot.argv = [tiddlyWikiFolder, '--listen', `port=${tiddlyWikiPort}`, 'root-tiddler=$:/core/save/lazy-images'];

$tw.boot.boot();

/** https://davidwalsh.name/javascript-debounce-function */
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const commitAndSync = debounce(() => {
  try {
    execSync(`/bin/sh ${commitScriptPath}`);
    console.log(`Sync to Git: /bin/sh ${syncScriptPath} under ${projectFolder}`);
    execSync(`/bin/sh ${syncScriptPath}`, { cwd: projectFolder });
  } catch (error) {
    console.error('Sync failed');
    console.error(error);
    console.error(error.stdout.toString('utf8'));
    console.error(error.stderr.toString('utf8'));
  }
}, COMMIT_INTERVAL);

fs.watch(
  tiddlyWikiFolder,
  { recursive: true },
  debounce((_, fileName) => {
    if (frequentlyChangedFileThatShouldBeIgnoredFromWatch.includes(fileName)) {
      return;
    }
    console.log(`${fileName} change`);

    commitAndSync();
  }, 100)
);

console.log(`wiki watch ${tiddlyWikiFolder} now`);
