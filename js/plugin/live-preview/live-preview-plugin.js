define(function(require) {

    var Plugin = require('core/plugin'),
        InitLivePreviewController = require('plugin/live-preview/controller/init-live-preview-controller');

    /**
     * Live HTML preview of the script, displayed next to the editor
     */
    var LivePreviewPlugin = Plugin.extend({

        $create: function(context) {
            context.register(InitLivePreviewController.create());
        }

    });

    return LivePreviewPlugin;
});
