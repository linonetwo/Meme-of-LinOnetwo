const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const tiddlyWikiPort = require('./package.json').port;
const wikiFolderName = require('./package.json').name;
const repoFolder = path.dirname(__filename);
const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

module.exports = () =>
  fetch(
    `http://127.0.0.1:${tiddlyWikiPort}/recipes/default/tiddlers.json?filter=%5Ball%5Btiddlers%5D%5D%20-%5B%5B%24%3A%2FisEncrypted%5D%5D%20-%5Bprefix%5B%24%3A%2Ftemp%2F%5D%5D%20-%5Bprefix%5B%24%3A%2Fstatus%2F%5D%5D`
  )
    .then((response) => response.text())
    .then((tiddlersJSON) => {
      if (tiddlersJSON) {
        fs.writeFileSync(path.join(tiddlyWikiFolder, 'public', 'tiddlers.json'), tiddlersJSON);
      } else {
        throw new Error('getting tiddlers.json failed! Please keep your server up before commit.');
      }
    });
