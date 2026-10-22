define(function(require) {

    var Protoplast = require('protoplast'),
        BaseSectionViewPresenter = require('core/presenter/base-section-view-presenter'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorViewPresenter = BaseSectionViewPresenter.extend({

        scriptModel: {
            inject: 'script'
        },
        
        editorModel: {
            inject: EditorModel
        },
        
        init: function() {
            BaseSectionViewPresenter.init.call(this);

            this.view.on('editorContentChanged', this._editorContentChanged, this);
            
            Protoplast.utils.bind(this.scriptModel, 'script', function() {
                this.view.content = this.scriptModel.script;
            }.bind(this));
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            setTimeout(function () {
                this.view.content = this.scriptModel.script;
                this.view.refresh();

                if (this.editorModel.cursorPosition) {
                    this.view.setCursor(this.editorModel.cursorPosition);
                }

                if (this.editorModel.scrollInfo) {
                    this.view.scrollTo(this.editorModel.scrollInfo.left, this.editorModel.scrollInfo.top);
                }
                else if (this.editorModel.cursorPosition) {
                    var scrollTo = this.view.getScrollInfo();
                    if (scrollTo.top > 0) {
                        this.view.scrollTo(0, scrollTo.top + scrollTo.clientHeight - this.view.getDefaultTextHeight() * 2);
                    }
                }

            }.bind(this), 300);
        },

        
        _editorContentChanged: function() {
            this.scriptModel.script = this.view.getEditorContent();
        }
        
    });

    return EditorViewPresenter;
});