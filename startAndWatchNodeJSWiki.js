const fs = require('fs');
const path = require('path');
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();
const execSync = require('child_process').execSync;

const tiddlyWikiPort = 11012;
const tiddlyWikiFolder = path.join(__dirname, 'MemeOfLinonetwo');

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
  execSync(`/bin/sh ${commitScriptPath}`, () => {});
}, (1000 * 3600) / 2);
const buildHTMLEveryMinute = debounce(() => {
  execSync(`cd ${__dirname} && npm run build:nodejs2html`, () => {});
}, 1000 * 60);

fs.watch(
  tiddlyWikiFolder,
  { recursive: true },
  debounce(() => {
    buildHTMLEveryMinute();
    commitEveryHalfHour();
  }, 100)
);

console.log(`wiki watch ${tiddlyWikiFolder} now`);
