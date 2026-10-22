define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * Key/value storage in the browser's localStorage (JSON-encoded values).
     * Falls back to memory if localStorage is not available (e.g. blocked in a private window).
     */
    var Storage = Protoplast.extend({

        prefix: 'rightwrite.',

        _memory: null,

        $create: function() {
            this._memory = {};
        },

        setItem: function(key, value) {
            var textValue = JSON.stringify(value);
            try {
                window.localStorage.setItem(this.prefix + key, textValue);
            } catch (e) {
                this._memory[key] = textValue;
            }
        },

        getItem: function(key) {
            var textValue;
            try {
                textValue = window.localStorage.getItem(this.prefix + key);
            } catch (e) {
                textValue = this._memory.hasOwnProperty(key) ? this._memory[key] : null;
            }
            try {
                return JSON.parse(textValue);
            } catch (e) {
                return null;
            }
        }

    });

    return Storage;
});
