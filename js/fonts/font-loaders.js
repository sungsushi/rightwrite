/**
 * Fonts available for PDF export. Each font file (js/fonts/*.js) contains base64-encoded TTF files
 * and is loaded on demand, the first time a PDF is generated with that font.
 */
define(function(require) {

    var config = [
        {name: "Courier", label: "Courier", file: ""},
        {name: "CourierPrime", label: "Courier Prime", file: "courier-prime"},
        {name: "CourierPrimeCyrillic", label: "Courier Prime Cyrillic", file: "courier-prime-cyrillic"}
    ];

    // the built app ships fonts in bundle/js/fonts, the development page (dev.html) loads them from js/fonts
    var isBundle = !!document.querySelector('script[src*="bundle/js/"]'),
        basePath = isBundle ? 'bundle/js/fonts/' : 'js/fonts/';

    var loaders = {};
    config.forEach(function(font) {
        if (font.file) {
            loaders[font.name] = function(callback) {
                require([basePath + font.file + '.js?callback=define'], function(fonts) {
                    callback(fonts);
                });
            };
        } else {
            // standard PDF font, no need to embed
            loaders[font.name] = function(callback) {
                callback(null);
            };
        }
        loaders[font.name].config = font;
    });

    // list of fonts for settings
    loaders.fontsList = config;

    return loaders;
});
