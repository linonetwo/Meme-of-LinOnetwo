const path = require('path');
const execSync = require('child_process').execSync;

const wikiFolderName = require('../package.json').name;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

process.env['TIDDLYWIKI_PLUGIN_PATH'] = `${tiddlyWikiFolder}/plugins`;
process.env['TIDDLYWIKI_THEME_PATH'] = `${tiddlyWikiFolder}/themes`;

module.exports = function build() {
  // npm run build:prepare
  execSync(`rm -rf ${repoFolder}/public`);
  // npm run build:public
  execSync(
    `cp -r ./MemeOfLinonetwo/public/ ./public && cp ./MemeOfLinonetwo/tiddlers/favicon.ico ./public/favicon.ico && cp ./MemeOfLinonetwo/tiddlers/TiddlyWikiIconWhite.png ./public/TiddlyWikiIconWhite.png && cp ./MemeOfLinonetwo/tiddlers/TiddlyWikiIconBlack.png ./public/TiddlyWikiIconBlack.png`,
    { cwd: repoFolder }
  );
  // npm run build:nodejs2html
  execSync(`tiddlywiki MemeOfLinonetwo --build externalimages`, { cwd: repoFolder });
  // npm run build:sitemap
  execSync(
    `tiddlywiki MemeOfLinonetwo --rendertiddler sitemap sitemap.xml text/plain && mv ./MemeOfLinonetwo/output/sitemap.xml ./public/sitemap.xml`,
    { cwd: repoFolder }
  );
  // npm run build:minifyHTML
  execSync(
    `html-minifier-terser -c ./html-minifier-terser.config.json -o ./public/index.html ./MemeOfLinonetwo/output/index.html`,
    { cwd: repoFolder }
  );
  // npm run build:precache
  execSync(`workbox injectManifest workbox-config.js`, { cwd: repoFolder });
  // npm run build:clean
  execSync(`rm -r ./MemeOfLinonetwo/output`, { cwd: repoFolder });
  // npm run build:pluginLibrary
  execSync(
    `rm -rf node_modules/tiddlywiki/plugins/published && mkdir -p node_modules/tiddlywiki/plugins/published && cp -r MemeOfLinonetwo/plugins node_modules/tiddlywiki/plugins/published && tiddlywiki MemeOfLinonetwo --output public/library --build library`,
    { cwd: repoFolder }
  );
};
