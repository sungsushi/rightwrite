define(function(require) {

    var Protoplast = require('protoplast');

    var EditorModel = Protoplast.Model.extend({

        cursorPosition: null,

        scrollInfo: null

    });

    return EditorModel;
});
