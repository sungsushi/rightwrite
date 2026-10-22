define(function(require) {

    var Section = require('core/model/section'),
        EditorView = require('plugin/editor/view/editor-view');

    var EditorSection = Section.extend({

        title: 'Editor',

        MainContent: {
            value: EditorView
        }

    });

    return EditorSection;
});
