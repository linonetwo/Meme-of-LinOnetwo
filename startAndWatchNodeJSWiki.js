const fs = require('fs');
const path = require('path');
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();
const execSync = require('child_process').execSync;

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;

const projectFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(projectFolder, wikiFolderName);
const commitScriptPath = path.resolve(projectFolder, 'scripts', 'commit.sh');
const buildHTMLScriptPath = path.resolve(projectFolder, 'scripts', 'buildHTML.sh');
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

const commitEveryHalfHour = debounce(() => {
  console.log('pushing to Git');
  execSync(`/bin/sh ${commitScriptPath}`, () => {});
}, (1000 * 3600) / 2);
const buildHTMLEveryMinute = debounce(() => {
  console.log('building HTML');
  execSync(`/bin/sh ${buildHTMLScriptPath} ${tiddlyWikiFolder}`, () => {});
}, 1000 * 60);

fs.watch(
  tiddlyWikiFolder,
  { recursive: true },
  debounce((_, fileName) => {
    if (frequentlyChangedFileThatShouldBeIgnoredFromWatch.includes(fileName)) {
      return;
    }
    console.log(`${fileName} change`);

    buildHTMLEveryMinute();
    commitEveryHalfHour();
  }, 100)
);

console.log(`wiki watch ${tiddlyWikiFolder} now`);
