define(function(require) {

    var $ = require('jquery'),
        htmlmaker = require('utils/htmlmaker'),
        BaseSectionViewPresenter = require('core/presenter/base-section-view-presenter'),
        EditorController = require('plugin/editor/controller/editor-controller'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller');

    /**
     * Re-renders the preview when the script changes. While the user is typing in the editor
     * the update is postponed until typing stops for TYPING_DELAY ms. Other changes (opening a file,
     * changing settings) are rendered immediately.
     */
    var TYPING_DELAY = 3000,
        EDIT_EVENTS = 'keydown.livepreview input.livepreview paste.livepreview cut.livepreview drop.livepreview',
        RECENT_EDIT_WINDOW = 1000;

    var LivePreviewViewPresenter = BaseSectionViewPresenter.extend({

        settings: {
            inject: 'settings'
        },

        pdfController: {
            inject: 'pdf'
        },

        themeController: {
            inject: ThemeController
        },

        editorController: {
            inject: EditorController
        },

        _renderTimer: null,

        _lastEditTime: 0,

        init: function() {
            BaseSectionViewPresenter.init.call(this);
            this.view.on('lineClicked', this._goToLine, this);
            $(window).on('resize', this._onResize);
            $(document).on(EDIT_EVENTS, '.CodeMirror', this._onEditorInput);
        },

        destroy: function() {
            clearTimeout(this._renderTimer);
            $(window).off('resize', this._onResize);
            $(document).off('.livepreview');
        },

        _onEditorInput: function() {
            this._lastEditTime = Date.now();
        },

        _scriptChanged: function() {
            clearTimeout(this._renderTimer);
            this._setStatus('pending');
            this._renderTimer = setTimeout(this._render, this._isTyping() ? TYPING_DELAY : 0);
        },

        /**
         * True if the change comes from the user editing the script (rather than opening a file, changing settings, etc.)
         */
        _isTyping: function() {
            return Date.now() - this._lastEditTime < RECENT_EDIT_WINDOW;
        },

        _render: function() {
            var script = this.scriptModel.script || '',
                parsed, result, print;

            try {
                print = this.settings.print;
                parsed = this.scriptModel.parsed;
                result = htmlmaker.render({
                    parsed: parsed,
                    print: print,
                    config: this.pdfController.getPrintConfig()
                });

                this.view.pageWidth = print.page_width;
                this.view.render(result.html, !script.trim());
                this.themeController.setScriptTitle(this._getTitle(parsed));
                this._setStatus('ready');
            }
            catch (error) {
                this._setStatus('error');
                window.console.error('Could not render preview', error);
            }
        },

        _getTitle: function(parsed) {
            var title = '';
            (parsed.title_page || []).forEach(function(token) {
                if (token.is('title')) {
                    title = token.text;
                }
            });
            return title.replace(/[*_]/g, '').replace(/\s*\n\s*/g, ' ').trim();
        },

        _setStatus: function(status) {
            this.themeController.setPreviewStatus(status);
        },

        _goToLine: function(line) {
            this.editorController.goto(line);
        },

        _onResize: function() {
            this.view.updateSize();
        }

    });

    return LivePreviewViewPresenter;
});
