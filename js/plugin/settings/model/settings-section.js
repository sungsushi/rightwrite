define(function(require) {

    var Section = require('core/model/section'),
        SettingsView = require('plugin/settings/view/settings-view');

    var SettingsSection = Section.extend({

        title: 'Settings',

        MainContent: {
            value: SettingsView
        }

    });

    return SettingsSection;
});
