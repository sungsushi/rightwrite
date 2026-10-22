define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        MinimalTheme = require('theme/minimal/view/main');

    /**
     * Root view of the application
     *
     * @module view/app-view
     */
    var AppView = Protoplast.Component.extend({

        html: '<div class="app"><div data-comp="theme"></div></div>',

        theme: {
            component: MinimalTheme
        },

        init: function() {
            $('.loader').remove();
        },

        destroy: function() {
            Protoplast.Component.destroy.call(this);
            $.prompt.close();
        }

    });

    return AppView;
});
