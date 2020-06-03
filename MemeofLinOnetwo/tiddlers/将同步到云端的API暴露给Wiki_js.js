// https://www.electronjs.org/docs/api/context-bridge
const { contextBridge } = require('electron');

const wikiRepoPath = '/Users/linonetwo/Desktop/repo/Meme-of-LinOnetwo';

contextBridge.exposeInMainWorld('wiki', {
  sync: () => {
    const syncWikiScriptPath = `${wikiRepoPath}/scripts/watchWiki.js`;
    require(syncWikiScriptPath).commitAndSyncAll();
  },
});
