/*\
type: application/javascript
module-type: widget

Import Google Calendar event of today into TiddlyWiki
Usage: <$import-google-calendar-event tags="private GoogleCalendar" />

\*/
(function () {
  /*jslint node: true, browser: true */
  /*global $tw: true */
  'use strict';

  const Widget = require('$:/core/modules/widgets/widget.js').widget;

  class GoogleCalendarToTiddlyWikiWidget extends Widget {
    constructor(parseTreeNode, options) {
      super(parseTreeNode, options);
      this.initialise(parseTreeNode, options);
      this.state = {
        isSignedIn: false,
      };
    }

    /*
    Render this widget into the DOM
    */
    render(parent, nextSibling) {
      this.parentDomNode = parent;
      this.computeAttributes();
      const importButton = this.document.createElement('button');
      importButton.appendChild(
        this.document.createTextNode(this.state.isSignedIn ? 'Import Calendar' : 'Login to Google')
      );
      importButton.onclick = this.onImportButtonClick.bind(this);
      parent.insertBefore(importButton, nextSibling);
      this.domNodes.push(importButton);
    }

    async onImportButtonClick() {
      if (!this.state.isSignedIn) {
        try {
          await this.initClient();
          gapi.auth2.getAuthInstance().signIn();
        } catch (error) {
          console.error('GoogleCalendarToTiddlyWikiWidget: Error login using gapi client', error);
        }
      } else {
        try {
          await this.importToWiki();
        } catch (error) {
          console.error('GoogleCalendarToTiddlyWikiWidget: Error importToWiki', error);
        }
      }
    }

    /**
     *  Initializes the API client library and sets up sign-in state
     *  listeners.
     */
    async initClient() {
      // Client ID and API key from the Google Developer Console
      // we get it from tiddler
      const CLIENT_ID = $tw.wiki.getTiddler('GoogleCalendarCLIENT_ID').fields.text;
      const API_KEY = $tw.wiki.getTiddler('GoogleCalendarAPI_KEY').fields.text;

      // Array of API discovery doc URLs for APIs used by the script
      const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
      await new Promise((resolve) => gapi.load('client:auth2', resolve));
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));
      // Handle the initial sign-in state.
      this.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }

    /**
     *  Called when the signed in status changes, to update the UI
     *  appropriately. After a sign-in, the API is called.
     */
    updateSignInStatus(isSignedIn) {
      if (isSignedIn) {
        this.state.isSignedIn = true;
      } else {
        this.state.isSignedIn = false;
      }
      // this is like React forceUpdate, we use it because it is not fully reactive on this.state change
      this.refreshSelf();
    }

    async importToWiki() {
      console.log(await this.getTodayEvents());
    }

    /**
     * Get list of Calendar events, modify this if you want to customize it for your need
     */
    async getTodayEvents() {
      const calendarListResponse = await gapi.client.calendar.calendarList.list({ showDeleted: false });
      const calendarList = calendarListResponse.result.items;
      // I set every calendar need to be imported have a description starts with '任务类型'
      const allEventList = await Promise.all(
        calendarList
          .filter((calendar) => String(calendar.description).startsWith('任务类型'))
          .map((calendar) => {
            // get all events in the calendar
            return gapi.client.calendar.events
              .list({
                calendarId: calendar.id,
                // from midnight to next midnight
                timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
                timeMax: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
              })
              .then((eventResponse) => {
                return eventResponse.result.items;
              });
          })
      );
      return allEventList.flat();
    }
  }

  exports['import-google-calendar-event'] = GoogleCalendarToTiddlyWikiWidget;
})();
