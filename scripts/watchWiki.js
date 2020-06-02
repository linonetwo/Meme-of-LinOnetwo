const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const wikiFolderName = require('../package.json').name;
const privateWikiName = require('../package.json').privateWikiName;
const COMMIT_INTERVAL = (1000 * 60 * 60) / 2;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

const privateTiddlyWikiRepo = path.join(repoFolder, '..', privateWikiName);
const privateTiddlyWikiFolder = path.join(repoFolder, '..', privateWikiName, 'tiddlers');

const commitScriptPath = path.resolve(repoFolder, 'scripts', 'commit.sh');
const syncScriptPath = path.resolve(repoFolder, 'scripts', 'sync.sh');
const frequentlyChangedFileThatShouldBeIgnoredFromWatch = [
  'output',
  'tiddlers/$__StoryList.tid',
];

/** https://davidwalsh.name/javascript-debounce-function */
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
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
  execSync(`git config --bool branch.master.sync true`, { cwd: folder });
  execSync(`/bin/sh ${syncScriptPath}`, { cwd: folder });
}

const commitAndSync = debounce(folderPath => {
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

watchFolder(tiddlyWikiFolder, repoFolder);
if (fs.existsSync(privateTiddlyWikiRepo)) {
  watchFolder(privateTiddlyWikiFolder, privateTiddlyWikiRepo);
}
