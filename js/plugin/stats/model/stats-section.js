define(function(require) {

    var Section = require('core/model/section'),
        StatsView = require('plugin/stats/view/stats-view');

    var StatsSection = Section.extend({

        title: 'Stats',

        MainContent: {
            value: StatsView
        }

    });

    return StatsSection;
});
