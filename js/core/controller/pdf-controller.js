define(function(require) {

    var Protoplast = require('protoplast'),
        fontLoaders = require('fonts/font-loaders'),
        pdfmaker = require('utils/pdfmaker');

    var PdfController = Protoplast.Object.extend({

        settings: {
            inject: 'settings'
        },

        scriptModel: {
            inject: 'script'
        },

        /**
         * Generate PDF of the current script
         * @param {Function} callback - called with {blob, url}
         */
        getPdf: function(callback) {
            fontLoaders[this.settings.font_family](function(fonts) {
                pdfmaker.get_pdf({
                    callback: callback,
                    print: this.settings.print,
                    config: this.getPrintConfig(fonts),
                    parsed: this.scriptModel.parsed
                });
            }.bind(this));
        },

        /**
         * Print config shared by the PDF generator and the HTML preview
         * @param {Object} [fonts]
         */
        getPrintConfig: function(fonts) {
            return {
                fonts: fonts,
                print_title_page: this.settings.print_title_page,
                print_header: this.settings.print_header,
                print_footer: this.settings.print_footer,
                print_watermark: this.settings.print_watermark,
                scene_continuation_top: this.settings.scene_continuation_top,
                scene_continuation_bottom: this.settings.scene_continuation_bottom,
                text_scene_continued: this.settings.text_scene_continued,
                show_page_numbers: this.settings.show_page_numbers,
                embolden_scene_headers: this.settings.embolden_scene_headers,
                underline_scene_headers: this.settings.underline_scene_headers,
                number_sections: this.settings.number_sections,
                scenes_numbers: this.settings.scenes_numbers
            };
        }

    });

    return PdfController;
});