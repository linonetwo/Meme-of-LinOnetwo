const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();

const tiddlyWikiPort = require('../package.json').port;
const wikiFolderName = require('../package.json').name;
const userName = require('../package.json').userName;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);
const tiddlersFolder = path.join(tiddlyWikiFolder, 'tiddlers');
const bobServerConfigPath = path.join(tiddlyWikiFolder, 'settings', 'settings.json');

const bobServerConfig = JSON.parse(fs.readFileSync(bobServerConfigPath, 'utf-8'));
bobServerConfig.pluginsPath = `./${wikiFolderName}/plugins`;
bobServerConfig.themesPath = `./${wikiFolderName}/themes`;
bobServerConfig.editionsPath = `./${wikiFolderName}/`;
bobServerConfig.wikiPathBase = repoFolder;
bobServerConfig['ws-server'].port = tiddlyWikiPort;
fs.writeFileSync(bobServerConfigPath, JSON.stringify(bobServerConfig, null, '  '));

process.env['TIDDLYWIKI_PLUGIN_PATH'] = `${tiddlyWikiFolder}/plugins`;
process.env['TIDDLYWIKI_THEME_PATH'] = `${tiddlyWikiFolder}/themes`;
// add tiddly filesystem back https://github.com/Jermolene/TiddlyWiki5/issues/4484#issuecomment-596779416
$tw.boot.argv = [
  '+plugins/OokTech/Bob',
  tiddlyWikiFolder,
  '--wsserver', // port config in Meme-of-LinOnetwo/settings/settings.json
];

try {
  execSync(`find ${tiddlersFolder} -name '*StoryList.tid' -delete`);
} catch (error) {
  console.log(String(error));
}

module.exports = function startNodeJSWiki() {
  $tw.boot.boot();
};
