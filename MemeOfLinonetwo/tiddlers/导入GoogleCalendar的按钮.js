(function () {
  /*jslint node: true, browser: true */
  /*global $tw: false */
  'use strict';

  const Widget = require('$:/core/modules/widgets/widget.js').widget;

  class AddUpWidget extends Widget {
    constructor(parseTreeNode, options) {
      super(parseTreeNode, options);
      this.initialise(parseTreeNode, options);
    }

    /*
  Render this widget into the DOM
  */
    render(parent, nextSibling) {
      this.parentDomNode = parent;
      this.computeAttributes();
      this.execute();
      const buttonNode = document.createElement('button')
      parent.insertBefore(textNode, nextSibling);
      this.domNodes.push(textNode);
    }

    /*
  Compute the internal state of the widget
  */
    execute() {
      // Get parameters from our attributes
      //this.filter = this.getAttribute("filter");
      this.val1 = this.getAttribute('val1', '0');
      this.val2 = this.getAttribute('val2', '0');
      this.val3 = this.getAttribute('val3', '0');
      this.val4 = this.getAttribute('val4', '0');
      this.val5 = this.getAttribute('val5', '0');

      // Execute the math
      this.currentSum =
        Number(this.val1) + Number(this.val2) + Number(this.val3) + Number(this.val4) + Number(this.val5);
    }

    /*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
    refresh(changedTiddlers) {
      // Re-execute the filter to get the count
      this.computeAttributes();
      var oldCount = this.currentSum;
      this.execute();
      if (this.currentSum !== oldCount) {
        // Regenerate and rerender the widget and replace the existing DOM node
        this.refreshSelf();
        return true;
      } else {
        return false;
      }
    }
  }

  exports.addup = AddUpWidget;
})();
