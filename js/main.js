/**
 * RequireJS configuration shared by the development page (dev.html) and the production build.
 */
(function() {
    require.config({
        baseUrl: 'js',
        paths: {
            samples: '../samples/compiled',
            jquery: 'libs/jquery-1.11.1.min',
            handlebars: '../node_modules/handlebars/dist/handlebars.amd',
            saveAs: 'libs/FileSaver',
            d3: '../node_modules/d3/d3.min',
            pdfkit: '../node_modules/pdfkit/js/pdfkit.standalone',
            impromptu: 'libs/jquery-impromptu.min',
            protoplast: '../node_modules/protoplast/dist/protoplast',
            'aw-parser': '../node_modules/aw-parser/dist/aw-parser.amd',
            text: '../node_modules/requirejs-text/text'
        },
        shim: {
            handlebars: {
                exports: 'Handlebars'
            },
            saveAs: {
                exports: 'saveAs'
            }
        }
    });
})();
