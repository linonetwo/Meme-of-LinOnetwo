// https://www.electronjs.org/docs/api/context-bridge
const { contextBridge } = require('electron');
const path = require('path');

const wikiRepoPath = '/Users/linonetwo/Desktop/repo/wiki';
const scriptsPath = path.join(wikiRepoPath, 'scripts');
const { tiddlyWikiRepo, privateTiddlyWikiRepo, commitAndSync } = require(path.join(scriptsPath, 'watchWiki.js'));
const { isUnsync } = require(path.join(scriptsPath, 'checkGitState.js'));

contextBridge.exposeInMainWorld('wiki', {
  wikiPath: {
    tiddlyWikiRepo,
    privateTiddlyWikiRepo,
  },
  sync: (repoPath) => commitAndSync(repoPath),
  isUnsync: (repoPath) => isUnsync(repoPath),
});
