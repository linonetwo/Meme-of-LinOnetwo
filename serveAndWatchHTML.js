const fs = require('fs');
const http = require('http');
const execSync = require('child_process').execSync;
const path = require('path');

const watchFileName = 'tiddlywiki.html';
const renamedFileName = 'index.html';
const watchDir = path.resolve(process.env.HOME, 'Downloads');
const watchFilepath = path.resolve(watchDir, watchFileName);
const projectFolder = path.dirname(__filename);
const serverPort = require('./package.json').port;
const rootWikiPath = path.resolve(projectFolder, renamedFileName);
const commitScriptPath = path.resolve(projectFolder, 'scripts', 'commit.sh');

const config = {
  watchFileName,
  watchDir,
  watchFilepath,
  projectFolder,
  serverPort,
  rootWikiPath,
  commitScriptPath,
};

console.log(`current config \n ${JSON.stringify(config, null, '\t')}\n`);

http
  .createServer(function(req, res) {
    if (req.url !== `/${watchFileName}`) {
      res.writeHead(302, { Location: `http://127.0.0.1:${serverPort}/${watchFileName}` });
      res.end();
      return;
    }
    fs.readFile(rootWikiPath, function(_, data) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
      res.write(data);
      res.end();
    });
  })
  .listen(serverPort);

console.log(`wiki start at http://127.0.0.1:${serverPort}/${watchFileName}`);

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

const commitEveryHalfHour = debounce(() => {
  execSync(`/bin/sh ${commitScriptPath}`, () => {});
}, (1000 * 3600) / 2);

fs.watch(
  watchDir,
  debounce((_, filename) => {
    if (filename !== watchFileName) {
      return;
    }
    fs.exists(watchFilepath, function(exise) {
      if (!exise) {
        return;
      }
      fs.rename(watchFilepath, rootWikiPath, err => {
        if (!err) {
          commitEveryHalfHour();
        }
      });
    });
  }, 100)
);

console.log(`wiki watch ${watchDir} now`);
