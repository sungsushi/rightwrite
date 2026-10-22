define(function(require) {

    var Protoplast = require('protoplast'),
        FactsSection = require('plugin/stats/model/facts-section'),
        StatsSection = require('plugin/stats/model/stats-section'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller');
    
    var InitStatsController = Protoplast.Object.extend({

        themeController: {
            inject: ThemeController
        },

        init: function() {

            var factsSection = FactsSection.create('facts');
            this.themeController.addSection(factsSection);

            var statsSection = StatsSection.create('stats');
            this.themeController.addSection(statsSection);
        }
        
    });

    return InitStatsController;
});