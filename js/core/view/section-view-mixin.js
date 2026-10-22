define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * @mixin core/view/section-view-mixin
     */
    var SectionViewMixin = Protoplast.extend({
        
        section: null,

        /**
         * Hook called when the section is shown
         */
        show: function() {

        },

        /**
         * Hook called when the section is hidden
         */
        hide: function() {
            
        },

        /**
         * Hook called when the pane containing the section is resized
         */
        updateSize: function() {
            
        }
        
    });

    return SectionViewMixin;
});