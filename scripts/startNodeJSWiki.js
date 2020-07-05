const path = require('path');
const execSync = require('child_process').execSync;
const $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki();

const tiddlyWikiPort = require('../package.json').port;
const wikiFolderName = require('../package.json').name;
const userName = require('../package.json').userName;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);
const tiddlersFolder = path.join(tiddlyWikiFolder, 'tiddlers');

process.env['TIDDLYWIKI_PLUGIN_PATH'] = `${tiddlyWikiFolder}/plugins`;
process.env['TIDDLYWIKI_THEME_PATH'] = `${tiddlyWikiFolder}/themes`;
// add tiddly filesystem back https://github.com/Jermolene/TiddlyWiki5/issues/4484#issuecomment-596779416
$tw.boot.argv = [
  '+plugins/tiddlywiki/filesystem',
  '+plugins/tiddlywiki/tiddlyweb',
  '+plugins/OokTech/Bob',
  tiddlyWikiFolder,
  '--listen',
  `anon-username=${userName}`,
  `port=${tiddlyWikiPort + 1}`,
  'host=0.0.0.0',
  'root-tiddler=$:/core/save/lazy-images',
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
