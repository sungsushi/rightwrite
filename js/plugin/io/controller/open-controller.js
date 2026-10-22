define(function(require) {

    var Protoplast = require('protoplast'),
        IoModel = require('plugin/io/model/io-model'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller'),
        samples = require('samples');

    var LAST_USED_SCRIPT_KEY = 'last-used-script';

    var OpenController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        storage: {
            inject: 'storage'
        },

        themeController: {
            inject: ThemeController
        },

        ioModel: {
            inject: IoModel
        },

        init: function() {
            this.ioModel.lastUsedScript = this.storage.getItem(LAST_USED_SCRIPT_KEY);

            // keep a copy of the script in the browser so it can be restored on the next visit
            Protoplast.utils.bind(this.scriptModel, 'script', function() {
                if (this.scriptModel.script !== undefined) {
                    this.storage.setItem(LAST_USED_SCRIPT_KEY, this.scriptModel.script);
                }
            }.bind(this));
        },

        createNew: function() {
            this._setScript('');
        },

        openSample: function(name) {
            this._setScript(samples['samples/' + name + '.fountain']());
        },

        openLastUsed: function() {
            this._setScript(this.ioModel.lastUsedScript || '');
        },

        /**
         * Open a local .fountain, .txt or .fdx (Final Draft) file
         * @param {File} selectedFile
         */
        openFile: function(selectedFile) {
            var fileReader = new FileReader(),
                self = this;
            fileReader.onload = function() {
                self._setScript(this.result);
                self.ioModel.fountainFileName = selectedFile.name.replace(/\.[^.]*$/, '') + '.fountain';
                self.ioModel.pdfFileName = selectedFile.name.replace(/\.[^.]*$/, '') + '.pdf';
            };
            fileReader.readAsText(selectedFile);
        },

        _setScript: function(value) {
            this.scriptModel.format = undefined;
            this.ioModel.fountainFileName = '';
            this.ioModel.pdfFileName = '';
            this.scriptModel.script = value;
            this.themeController.clearSelectedSection();
        }

    });

    return OpenController;
});
