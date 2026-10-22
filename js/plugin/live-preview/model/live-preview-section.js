define(function(require) {

    var Section = require('core/model/section'),
        LivePreviewView = require('plugin/live-preview/view/live-preview-view');

    var LivePreviewSection = Section.extend({

        title: 'Preview',

        MainContent: {
            value: LivePreviewView
        }

    });

    return LivePreviewSection;
});
