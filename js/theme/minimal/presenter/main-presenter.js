define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        MinimalThemeModel = require('theme/minimal/model/minimal-theme-model'),
        MinimalThemeController = require('theme/minimal/controller/minimal-theme-controller'),
        OpenController = require('plugin/io/controller/open-controller'),
        SaveController = require('plugin/io/controller/save-controller');

    var MainPresenter = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeModel: {
            inject: MinimalThemeModel
        },

        themeController: {
            inject: MinimalThemeController
        },

        openController: {
            inject: OpenController
        },

        saveController: {
            inject: SaveController
        },

        init: function() {
            this.view.setPinnedSections(this.themeModel.getSection('editor'), this.themeModel.getSection('live-preview'));

            Protoplast.utils.bind(this.themeModel, {
                panelSection: this.view.showPanel.bind(this.view),
                scriptTitle: this.view.setTitle.bind(this.view),
                previewStatus: this.view.setStatus.bind(this.view),
                'tooltip.text': this._updateTooltip,
                'tooltip.x': this._updateTooltip,
                'tooltip.y': this._updateTooltip
            });

            this.view.on('menuAction', this._menuAction, this);
            this.view.on('panelClosed', this.themeController.closePanel, this.themeController);
            this.view.on('fileSelected', this._openFile, this);
            this.view.on('resized', this.themeController.updateSize, this.themeController);
        },

        /**
         * Open the last used script (or an empty one) if nothing has been loaded on startup
         */
        _openInitialScript: {
            sub: 'app/init',
            value: function() {
                setTimeout(function() {
                    if (this.scriptModel.script !== undefined) {
                        return;
                    }
                    this.openController.openLastUsed();
                }.bind(this), 0);
            }
        },

        _menuAction: function(event) {
            switch (event.action) {
            case 'new':
                this._confirmReplace(function() {
                    this.openController.createNew();
                });
                break;
            case 'open':
                this._confirmReplace(function() {
                    this.view.openFileDialog();
                });
                break;
            case 'sample':
                this._confirmReplace(function() {
                    this.openController.openSample(event.value);
                });
                break;
            case 'save':
                this.saveController.saveFountainLocally();
                break;
            case 'pdf':
                this.saveController.savePdfLocally();
                break;
            case 'settings':
            case 'facts':
            case 'stats':
            case 'info':
                this.themeController.selectSectionByName(event.action);
                break;
            }
        },

        _openFile: function(file) {
            this.openController.openFile(file);
        },

        /**
         * Ask before replacing a script that has content
         */
        _confirmReplace: function(callback) {
            var script = this.scriptModel.script || '';
            callback = callback.bind(this);

            if (!script.trim()) {
                callback();
                return;
            }

            $.prompt('Replace the current script? Save it first if you want to keep it.', {
                buttons: {
                    'Replace': true,
                    'Cancel': false
                },
                submit: function(e, value) {
                    if (value) {
                        callback();
                    }
                }
            });
        },

        _updateTooltip: function() {
            var tooltip = this.themeModel.tooltip,
                $tooltip = $('.mn-tooltip');

            if (!tooltip.text) {
                $tooltip.remove();
                return;
            }
            if (!$tooltip.length) {
                $tooltip = $('<div class="mn-tooltip"></div>').appendTo(document.body);
            }
            $tooltip.html(tooltip.text).css({
                top: (tooltip.y - 10) + 'px',
                left: (tooltip.x + 10) + 'px'
            });
        }

    });

    return MainPresenter;
});
