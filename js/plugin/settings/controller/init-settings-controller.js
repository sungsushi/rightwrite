define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsSection = require('plugin/settings/model/settings-section'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller');

    var InitSettingsController = Protoplast.Object.extend({

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var settingsSection = SettingsSection.create('settings');
            this.themeController.addSection(settingsSection);
        }
        
    });

    return InitSettingsController;
});