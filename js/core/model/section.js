define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * A section registered by a plugin (editor, preview, settings...). The theme decides where it is displayed.
     *
     * @module core/model/section
     */
    var Section = Protoplast.Model.extend({

        name: null,

        title: null,

        /**
         * View displayed for the section (created from MainContent)
         * @type {SectionViewMixin}
         */
        mainContent: null,

        /**
         * True when the section is displayed
         */
        isActive: undefined,

        $create: function(name) {
            this.name = name;
            if (this.MainContent) {
                this.mainContent = this.MainContent.create();
            }
        }

    });

    return Section;
});
