define(function(require) {

    var template = require('text!plugin/info/view/info.hbs'),
        BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('core/view/section-view-mixin');

    return BaseComponent.extend([SectionViewMixin], {

        hbs: template

    });

});
