const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;
const repoFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

module.exports = () =>
  fetch(
    `http://127.0.0.1:${tiddlyWikiPort}/recipes/default/tiddlers.json?filter=[all[tiddlers]] -[[%24%3A%2FisEncrypted]] -[prefix[%24%3A%2Ftemp%2F]] -[prefix[%24%3A%2Fstatus%2F]]`
  )
    .then((response) => response.text())
    .then((tiddlersJSON) => fs.writeFileSync(path.join(tiddlyWikiFolder, 'public', 'tiddlers.json'), tiddlersJSON));
