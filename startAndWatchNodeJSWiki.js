const fs = require('fs');
const path = require('path');
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();
const execSync = require('child_process').execSync;

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name

const projectFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(__dirname, wikiFolderName);
const commitScriptPath = path.resolve(projectFolder, 'scripts', 'commit.sh');

$tw.boot.argv = [tiddlyWikiFolder, '--listen', `port=${tiddlyWikiPort}`];

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
  execSync(`cd ${projectFolder} && npm run build:nodejs2html`, () => {});
}, 1000 * 60);

fs.watch(
  tiddlyWikiFolder,
  { recursive: true },
  debounce((_, fileName) => {
    if (fileName === 'output') return;
    console.log(`${fileName} change`);

    buildHTMLEveryMinute();
    commitEveryHalfHour();
  }, 100)
);

console.log(`wiki watch ${tiddlyWikiFolder} now`);
