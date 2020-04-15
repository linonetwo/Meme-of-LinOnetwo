const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;
const repoFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

module.exports = () =>
  fetch(`http://127.0.0.1:${tiddlyWikiPort}/recipes/default/tiddlers.json`)
    .then((response) => response.text())
    .then((tiddlersJSON) => {
      if (tiddlersJSON) {
        fs.writeFileSync(path.join(tiddlyWikiFolder, 'public', 'tiddlers.json'), tiddlersJSON);
      } else {
        throw new Error('getting tiddlers.json failed! Please keep your server up before commit.');
      }
    });
