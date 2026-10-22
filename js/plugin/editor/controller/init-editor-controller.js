define(function(require) {

    var Protoplast = require('protoplast'),
        EditorSection = require('plugin/editor/model/editor-section'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller');

    var InitEditorController = Protoplast.Object.extend({

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var editorSection = EditorSection.create('editor');
            this.themeController.addSection(editorSection);
        }
    });

    return InitEditorController;
});