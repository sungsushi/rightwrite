define(function(require) {

    var Protoplast = require('protoplast'),
        TooltipModel = require('theme/minimal/model/tooltip');

    /**
     * Theme model for the two-pane layout.
     *
     * Plugins register sections (editor, live preview, settings, stats...). Sections listed in
     * pinnedSections are always active and displayed in the panes (editor on the left, preview on the right).
     * Any other section is displayed in a centred panel when selected.
     *
     * @module theme/minimal/model/minimal-theme-model
     */
    var MinimalThemeModel = Protoplast.Model.extend({

        pinnedSections: {
            value: ['editor', 'live-preview']
        },

        /**
         * All registered sections
         */
        sections: null,

        sectionsMap: null,

        /**
         * Section displayed in the panel (null if the panel is closed)
         */
        panelSection: null,

        /**
         * Script title displayed in the top bar
         */
        scriptTitle: '',

        /**
         * One of: 'idle', 'pending', 'ready', 'error'
         */
        previewStatus: 'idle',

        tooltip: null,

        width: undefined,

        height: undefined,

        small: {
            computed: ['width'],
            value: function() {
                return window.innerWidth < 800;
            }
        },

        $create: function() {
            this.sections = Protoplast.Collection.create();
            this.sectionsMap = {};
            this.tooltip = TooltipModel.create();
        },

        addSection: function(name, section) {
            this.sectionsMap[name] = section;
            this.sections.add(section);
        },

        getSection: function(name) {
            return this.sectionsMap[name];
        },

        isPinned: function(section) {
            return !!section && this.pinnedSections.indexOf(section.name) !== -1;
        }

    });

    return MinimalThemeModel;
});
