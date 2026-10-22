define(function(require) {

    var Section = require('core/model/section'),
        InfoView = require('plugin/info/view/info-view');

    var InfoSection = Section.extend({

        title: 'About',

        MainContent: {
            value: InfoView
        }

    });

    return InfoSection;
});
