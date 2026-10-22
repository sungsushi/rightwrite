define(function(require) {

    var Protoplast = require('protoplast');

    var EditorModel = Protoplast.Model.extend({

        cursorPosition: null,

        scrollInfo: null,

        /**
         * Line to briefly highlight next time the editor is activated (set by "go to line")
         */
        highlightLine: null

    });

    return EditorModel;
});
