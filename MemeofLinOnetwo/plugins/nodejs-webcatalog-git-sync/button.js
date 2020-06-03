/*\
Show local git state and sync to git on click.
Requires you are using WebCatalog, and have install the "Inject JS" API with access to NodeJS and Electron API).

\*/
(function () {
  /*jslint node: true, browser: true */
  /*global $tw: true */
  'use strict';

  const Widget = require('$:/core/modules/widgets/widget.js').widget;

  class NodeJSWebCatalogGitSyncWidget extends Widget {
    /**
     * Lifecycle method: call this.initialise and super
     */
    constructor(parseTreeNode, options) {
      super(parseTreeNode, options);
      this.initialise(parseTreeNode, options);
      this.state = {
        needSetUp: false, // need to setup WebCatalog, or just API missing
        interval: 3000, // check interval
        count: 0, // things need to commit
        unsync: false, // need to push to github
        syncing: false, // a sync is in progress
      };
      this.checkInLoop();
    }

    /**
     * Lifecycle method: Render this widget into the DOM
     */
    render(parent, nextSibling) {
      // boilerplate
      this.parentDomNode = parent;
      this.computeAttributes();

      // DOM
      const importButton = this.document.createElement('button');
      importButton.className = 'tc-btn-invisible tc-btn-plugins-linonetwo-nodejs-webcatalog-git-sync ';
      importButton.onclick = this.onSyncButtonClick.bind(this);

      // set icon
      if (this.state.needSetUp) {
        // all commit and sync to cloud
        importButton.className += 'git-sync';
        importButton.disabled = true;
        // tooltip
        const label = 'Need to setup WebCatalog';
        importButton.title = label;
        importButton['aria-label'] = label;
        // icon
        importButton.innerHTML = $tw.wiki.getTiddlerText(
          '$:/plugins/linonetwo/nodejs-webcatalog-git-sync/icons/git-sync.svg'
        );
      } else if (this.state.syncing) {
        // all commit and sync to cloud
        importButton.className += 'git-sync syncing';
        importButton.disabled = true;
        // tooltip
        const label = 'Syncing to the Cloud';
        importButton.title = label;
        importButton['aria-label'] = label;
        // icon
        importButton.innerHTML = $tw.wiki.getTiddlerText(
          '$:/plugins/linonetwo/nodejs-webcatalog-git-sync/icons/git-sync.svg'
        );
      } else if (this.state.count === 0 && !this.state.unsync) {
        // all commit and sync to cloud
        importButton.className += 'git-sync';
        importButton.disabled = true;
        // tooltip
        const label = 'All Sync With Cloud';
        importButton.title = label;
        importButton['aria-label'] = label;
        // icon
        importButton.innerHTML = $tw.wiki.getTiddlerText(
          '$:/plugins/linonetwo/nodejs-webcatalog-git-sync/icons/git-sync.svg'
        );
      } else if (this.state.count === 0 && this.state.unsync) {
        // some commit need to sync to the cloud
        importButton.className += 'git-pull-request';
        // tooltip
        const label = 'Need a Push to the Cloud';
        importButton.title = label;
        importButton['aria-label'] = label;
        // icon
        importButton.innerHTML = $tw.wiki.getTiddlerText(
          '$:/plugins/linonetwo/nodejs-webcatalog-git-sync/icons/git-pull-request.svg'
        );
      } else {
        // some need to commit, and not sync to cloud yet
        importButton.className += 'git-pull-request';
        // tooltip
        const label = `${this.state.count} files Need Commit and Push`;
        importButton.title = label;
        importButton['aria-label'] = label;
        // icon
        const iconSVG = $tw.wiki.getTiddlerText(
          '$:/plugins/linonetwo/nodejs-webcatalog-git-sync/icons/git-pull-request.svg'
        );
        // add count indicator badge
        const countIndicator = `<span>${this.state.count}</span>`;
        importButton.innerHTML = `<span>${iconSVG}${countIndicator}</span>`;
      }

      // boilerplate
      parent.insertBefore(importButton, nextSibling);
      this.domNodes.push(importButton);
    }

    /**
     * Event listener of button
     */
    async onSyncButtonClick() {
      if (!this.state.syncing) {
        this.state.syncing = true;
        this.refreshSelf();
        try {
          const publicRepoState = await window.wiki.isUnsync(window.wiki.wikiPath.tiddlyWikiRepo);
          const privateRepoState = await window.wiki.isUnsync(window.wiki.wikiPath.privateTiddlyWikiRepo);
          if (publicRepoState) {
            await window.wiki.sync(window.wiki.wikiPath.tiddlyWikiRepo);
          }
          if (privateRepoState) {
            await window.wiki.sync(window.wiki.wikiPath.privateTiddlyWikiRepo);
          }
          this.state.syncing = false;
          this.refreshSelf();
        } catch (error) {
          console.error('NodeJSWebCatalogGitSyncWidget: Error login using gapi client', error);
        }
      }
    }

    /**
     * Check state every a few time
     */
    async checkInLoop() {
      // check if API from WebCatalog is available, first time it is Server Side Rendening so window.xxx from the electron ContextBridge will be missing
      if (typeof window?.wiki?.isUnsync !== 'function' || typeof window?.wiki?.sync !== 'function') {
        this.state.needSetUp = true;
      } else {
        this.state.needSetUp = false;
        this.checkGitState();
      }
      setTimeout(() => {
        this.checkInLoop();
      }, this.state.interval);
    }

    /**
     *  Check repo git sync state and count of uncommit things
     */
    async checkGitState() {
      // { unsync: boolean, uncommit: number } | boolean
      const publicRepoState = await window.wiki.isUnsync(window.wiki.wikiPath.tiddlyWikiRepo);
      const privateRepoState = await window.wiki.isUnsync(window.wiki.wikiPath.privateTiddlyWikiRepo);

      this.state.count = 0;
      this.state.unsync = false;
      if (publicRepoState) {
        this.state.count += publicRepoState.uncommit;
        this.state.unsync |= publicRepoState.unsync;
      }
      if (privateRepoState) {
        this.state.count += privateRepoState.uncommit;
        this.state.unsync |= privateRepoState.unsync;
      }

      return this.refreshSelf(); // method from super class, this is like React forceUpdate, we use it because it is not fully reactive on this.state change
    }
  }

  exports['nodejs-webcatalog-git-sync'] = NodeJSWebCatalogGitSyncWidget;
})();
