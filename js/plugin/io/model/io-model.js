define(function(require) {

    var Protoplast = require('protoplast');

    var IoModel = Protoplast.Model.extend({

        /**
         * Last used file names (used as defaults when saving)
         */
        fountainFileName: null,

        pdfFileName: null,

        /**
         * Script stored in the browser when the app was last used
         * @type {string}
         */
        lastUsedScript: null

    });

    return IoModel;
});
