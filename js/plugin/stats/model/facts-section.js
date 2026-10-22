define(function(require) {

    var Section = require('core/model/section'),
        FactsView = require('plugin/stats/view/facts-view');

    var FactsSection = Section.extend({

        title: 'Facts',

        MainContent: {
            value: FactsView
        }

    });

    return FactsSection;
});
