define(function(require) {

    var Protoplast = require('protoplast'),
        LivePreviewSection = require('plugin/live-preview/model/live-preview-section'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller');

    var InitLivePreviewController = Protoplast.Object.extend({

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var livePreviewSection = LivePreviewSection.create('live-preview');
            this.themeController.addSection(livePreviewSection);
        }

    });

    return InitLivePreviewController;
});
