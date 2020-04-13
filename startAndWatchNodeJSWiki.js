const fs = require('fs');
const path = require('path');
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();
const execSync = require('child_process').execSync;

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;
const COMMIT_INTERVAL = (1000 * 10) / 2;

const projectFolder = path.dirname(__filename);

const tiddlyWikiFolder = path.join(projectFolder, wikiFolderName);
const privateTiddlyWikiFolder = path.join(projectFolder, '..', 'private-Meme-of-LinOnetwo');

const commitScriptPath = path.resolve(projectFolder, 'scripts', 'commit.sh');
const syncScriptPath = path.resolve(projectFolder, 'scripts', 'sync.sh');
const frequentlyChangedFileThatShouldBeIgnoredFromWatch = [
  'output',
  'tiddlers/$__StoryList.tid',
  'tiddlers/$__plugins_felixhayashi_tiddlymap_misc_defaultViewHolder.tid',
];

process.env['TIDDLYWIKI_PLUGIN_PATH'] = `${tiddlyWikiFolder}/plugins`;
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

function syncToGit(folder) {
  console.log(`Sync to Git: /bin/sh ${syncScriptPath} under ${folder}`);
  execSync(`git config --bool branch.master.sync true`, { cwd: folder })
  execSync(`/bin/sh ${syncScriptPath}`, { cwd: folder });
}

const commitAndSync = debounce((folderPath) => {
  try {
    execSync(`/bin/sh ${commitScriptPath}`, { cwd: folderPath });
    syncToGit(folderPath);
  } catch (error) {
    console.error('Sync failed');
    // console.error(error);
    console.error(error.stdout.toString('utf8'));
    console.error(error.stderr.toString('utf8'));
  }
}, COMMIT_INTERVAL);

function watchFolder(wikiFolderPath, repoPath) {
  fs.watch(
    wikiFolderPath,
    { recursive: true },
    debounce((_, fileName) => {
      if (frequentlyChangedFileThatShouldBeIgnoredFromWatch.includes(fileName)) {
        return;
      }
      console.log(`${fileName} change`);

      commitAndSync(repoPath);
    }, 100)
  );
  console.log(`wiki watch ${wikiFolderPath} now`);
}

watchFolder(tiddlyWikiFolder, projectFolder);
watchFolder(privateTiddlyWikiFolder, privateTiddlyWikiFolder);
