define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorController = Protoplast.Object.extend({

        editorModel: {
            inject: EditorModel
        },

        themeController: {
            inject: ThemeController
        },

        /**
         * Move the editor cursor to the given line (used by the preview and stats charts)
         * @param {number} line
         */
        goto: function(line) {
            this.editorModel.cursorPosition = {
                ch: 0,
                line: line,
                xRel: 0
            };
            this.editorModel.scrollInfo = null;

            this.themeController.selectSectionByName('editor');
        }

    });

    return EditorController;
});
