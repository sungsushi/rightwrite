define(function(require) {

    var Protoplast = require('protoplast'),
        MinimalThemeModel = require('theme/minimal/model/minimal-theme-model');

    /**
     * Theme controller used by plugins to register and select sections.
     * Pinned sections (editor, live preview) are always active, other sections are shown in a panel.
     *
     * @module theme/minimal/controller/minimal-theme-controller
     */
    var MinimalThemeController = Protoplast.Object.extend({

        themeModel: {
            inject: MinimalThemeModel
        },

        addSection: function(section) {
            this.themeModel.addSection(section.name, section);
            if (this.themeModel.isPinned(section)) {
                section.isActive = true;
            }
        },

        selectSection: function(selectedSection) {
            var themeModel = this.themeModel;

            themeModel.tooltip.text = '';

            if (themeModel.isPinned(selectedSection)) {
                // re-activate a pinned section so it can restore its state (e.g. editor cursor after "go to line")
                selectedSection.isActive = false;
                selectedSection.isActive = true;
                selectedSection = null;
            }

            themeModel.panelSection = selectedSection;
            themeModel.sections.forEach(function(section) {
                if (!themeModel.isPinned(section)) {
                    section.isActive = section === selectedSection;
                }
            });
        },

        selectSectionByName: function(name) {
            this.selectSection(this.themeModel.getSection(name));
        },

        clearSelectedSection: function() {
            this.selectSection(null);
        },

        closePanel: function() {
            this.selectSection(null);
        },

        setScriptTitle: function(title) {
            this.themeModel.scriptTitle = title;
        },

        setPreviewStatus: function(status) {
            this.themeModel.previewStatus = status;
        },

        showTooltip: function(text) {
            this.themeModel.tooltip.text = text;
        },

        hideTooltip: function() {
            this.themeModel.tooltip.text = '';
        },

        moveTooltip: function(x, y) {
            this.themeModel.tooltip.x = x;
            this.themeModel.tooltip.y = y;
        },

        updateSize: function() {
            this.themeModel.width = window.innerWidth;
            this.themeModel.height = window.innerHeight;
        }

    });

    return MinimalThemeController;
});
