define(function(require) {

    var Plugin = require('core/plugin'),
        IoModel = require('plugin/io/model/io-model'),
        OpenController = require('plugin/io/controller/open-controller'),
        SaveController = require('plugin/io/controller/save-controller');

    /**
     * Opening and saving scripts (local files, samples, last used script) and exporting PDFs
     */
    var IoPlugin = Plugin.extend({

        $create: function(context) {
            context.register(IoModel.create());
            context.register(OpenController.create());
            context.register(SaveController.create());
        }

    });

    return IoPlugin;
});
