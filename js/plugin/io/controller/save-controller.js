define(function(require) {

    var Protoplast = require('protoplast'),
        IoModel = require('plugin/io/model/io-model'),
        $ = require('jquery'),
        saveAs = require('saveAs'),
        forms = require('utils/forms');

    /**
     * Saving the script as .fountain and exporting PDF. Uses the browser's native "Save as" dialog
     * (File System Access API) when available, otherwise asks for a file name and downloads the file.
     */
    var SaveController = Protoplast.Object.extend({

        ioModel: {
            inject: IoModel
        },

        scriptModel: {
            inject: 'script'
        },

        pdfController: {
            inject: 'pdf'
        },

        saveFountainLocally: function() {
            var fileName = this.ioModel.fountainFileName || this._defaultFileName('fountain');

            var save = function(blob, name) {
                this.ioModel.fountainFileName = name;
                this.ioModel.pdfFileName = name.replace(/\.[^.]*$/, '') + '.pdf';
            }.bind(this);

            var getBlob = function(callback) {
                callback(new Blob([this.scriptModel.script], {
                    type: "text/plain;charset=utf-8"
                }));
            }.bind(this);

            if (this._saveWithFilePicker(fileName, 'Fountain screenplay', 'text/plain', '.fountain', getBlob, save)) {
                return;
            }

            forms.text('Select file name:', fileName, function (result) {
                getBlob(function(blob) {
                    save(blob, result.text);
                    saveAs(blob, result.text);
                });
            });
        },

        savePdfLocally: function() {
            var fileName = this.ioModel.pdfFileName || this._defaultFileName('pdf');

            var save = function(blob, name) {
                this.ioModel.pdfFileName = name;
                this.ioModel.fountainFileName = name.replace(/\.[^.]*$/, '') + '.fountain';
            }.bind(this);

            var getBlob = function(callback) {
                this.pdfController.getPdf(function(pdf) {
                    callback(pdf.blob);
                });
            }.bind(this);

            if (this._saveWithFilePicker(fileName, 'PDF document', 'application/pdf', '.pdf', getBlob, save)) {
                return;
            }

            forms.text('Select file name:', fileName, function (result) {
                getBlob(function(blob) {
                    save(blob, result.text);
                    saveAs(blob, result.text);
                });
            });
        },

        /**
         * Save using the browser's native "Save as" dialog (folder navigation), if available.
         * Must be called directly from a user action (click/shortcut).
         *
         * @returns {boolean} false if the browser does not support the File System Access API
         */
        _saveWithFilePicker: function(suggestedName, description, mimeType, extension, getBlob, onSaved) {
            if (typeof window.showSaveFilePicker !== 'function') {
                return false;
            }

            var accept = {};
            accept[mimeType] = [extension];

            window.showSaveFilePicker({
                id: 'rightwrite-save',
                suggestedName: suggestedName,
                types: [{description: description, accept: accept}]
            }).then(function(handle) {
                return new Promise(getBlob).then(function(blob) {
                    return handle.createWritable().then(function(writable) {
                        return writable.write(blob).then(function() {
                            return writable.close();
                        });
                    }).then(function() {
                        onSaved(blob, handle.name);
                    });
                });
            }).catch(function(error) {
                if (error && error.name === 'AbortError') {
                    return; // dialog cancelled
                }
                $.prompt('Could not save the file' + (error && error.message ? ': ' + error.message : '.'));
            });

            return true;
        },

        /**
         * File name based on the script title, e.g. "Brick & Steel" -> "brick-steel.pdf"
         */
        _defaultFileName: function(extension) {
            var title = '';
            try {
                (this.scriptModel.parsed.title_page || []).forEach(function(token) {
                    if (token.is('title')) {
                        title = token.text;
                    }
                });
            } catch (e) {
                title = '';
            }
            var slug = title.replace(/[*_]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return (slug || 'screenplay') + '.' + extension;
        }

    });

    return SaveController;
});
