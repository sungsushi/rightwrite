define(function(require) {

    /**
     * Renders a parsed script as HTML pages. Mirrors the layout logic of utils/pdfmaker (same print profile,
     * same positions in inches) so the preview matches the generated PDF page by page.
     *
     * All positions are expressed as multiples of the CSS variable --u (pixels per inch) which is set
     * on the preview container. This allows zooming without re-rendering.
     */
    var helper = require('utils/helper');

    var module = {};

    var escape_html = function(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var inches = function(value) {
        return 'calc(var(--u) * ' + value.toFixed(4) + ')';
    };

    var get_title_page_token = function(parsed, type) {
        var result = null;
        if (parsed && parsed.title_page) {
            parsed.title_page.forEach(function(token) {
                if (token.is(type)) {
                    result = token;
                }
            });
        }
        return result;
    };

    /**
     * Creates a page writer collecting absolutely positioned lines. Formatting state (bold/italic/underline/notes)
     * is kept between lines the same way pdfmaker keeps it, so emphasis spanning wrapped lines works.
     */
    function createWriter(print) {
        var pages = [],
            current = null,
            format_state;

        var reset_format = function() {
            format_state = {
                bold: false,
                italic: false,
                underline: false,
                override_color: null
            };
        };
        reset_format();

        var writer = {};

        writer.addPage = function(className) {
            current = {
                className: className || '',
                html: []
            };
            pages.push(current);
        };

        writer.raw = function(html) {
            current.html.push(html);
        };

        writer.text = function(text, x, y, options) {
            options = options || {};
            var color = options.color || '#000000';

            if (print.note.italic) {
                text = text.replace(/\[\[/g, '*[[').replace(/\]\]/g, ']]*');
            }

            var parts = text.split(/(\\\*)|(\*{1,3})|(\\?_)|(\[\[)|(\]\])/g).filter(function(a) {
                return a;
            });

            var html = '';
            parts.forEach(function(elem) {
                if (elem === '***') {
                    format_state.italic = !format_state.italic;
                    format_state.bold = !format_state.bold;
                } else if (elem === '**') {
                    format_state.bold = !format_state.bold;
                } else if (elem === '*') {
                    format_state.italic = !format_state.italic;
                } else if (elem === '_') {
                    format_state.underline = !format_state.underline;
                } else if (elem === '[[') {
                    format_state.override_color = (print.note && print.note.color) || '#000000';
                } else if (elem === ']]') {
                    format_state.override_color = null;
                } else {
                    if (elem === '\\_' || elem === '\\*') {
                        elem = elem.substr(1, 1);
                    }
                    var classes = [];
                    if (format_state.bold) {
                        classes.push('b');
                    }
                    if (format_state.italic) {
                        classes.push('i');
                    }
                    if (format_state.underline) {
                        classes.push('u');
                    }
                    var span_color = format_state.override_color || color;
                    html += '<span' +
                        (classes.length ? ' class="' + classes.join(' ') + '"' : '') +
                        (span_color !== '#000000' ? ' style="color:' + span_color + '"' : '') +
                        '>' + escape_html(elem) + '</span>';
                }
            });

            writer.raw('<div class="sp-line' + (options.className ? ' ' + options.className : '') + '"' +
                (options.line !== undefined ? ' data-line="' + options.line + '"' : '') +
                ' style="left:' + inches(x) + ';top:' + inches(y) + '">' + html + '</div>');
        };

        // text without formatting state carried over (used for headers, footers, page numbers)
        writer.format_text = function(text, x, y, options) {
            var cache = format_state;
            reset_format();
            writer.text(text, x, y, options);
            format_state = cache;
        };

        writer.simple_text = function(text, x, y) {
            writer.raw('<div class="sp-line" style="left:' + inches(x) + ';top:' + inches(y) + '">' +
                escape_html(text) + '</div>');
        };

        writer.getPages = function() {
            return pages;
        };

        return writer;
    }

    function generate(writer, opts) {
        var parsed = opts.parsed,
            cfg = opts.config,
            print = opts.print,
            lines = parsed.lines;

        var center = function(txt, y, options) {
            var txt_length = txt.replace(/\*/g, '').replace(/_/g, '').length;
            var feed = (print.page_width - txt_length * print.font_width) / 2;
            writer.text(txt, feed, y, options);
        };

        var token_line = function(line) {
            return line.token && line.token.line !== undefined ? line.token.line : undefined;
        };

        var title_y = print.title_page.top_start;

        var title_page_next_line = function() {
            title_y += print.line_spacing * print.font_height;
        };

        var title_page_main = function(parsed, type, options) {
            options = options || {};
            if (arguments.length === 0) {
                title_page_next_line();
                return;
            }
            var token = get_title_page_token(parsed, type);
            if (token) {
                token.text.split('\n').forEach(function(line) {
                    if (options.capitalize) {
                        line = line.toUpperCase();
                    }
                    center(line, title_y);
                    title_page_next_line();
                });
            }
        };

        var has_title_page = parsed.title_page && parsed.title_page.length > 0;

        if (cfg.print_title_page && has_title_page) {
            writer.addPage('sp-title-page');

            title_page_main(parsed, 'title', {
                capitalize: true
            });
            title_page_main();
            title_page_main();
            title_page_main(parsed, 'credit');
            title_page_main();
            title_page_main(parsed, 'author');
            title_page_main();
            title_page_main();
            title_page_main();
            title_page_main();
            title_page_main(parsed, 'source');

            var concat_types = function(parsed, prev, type) {
                var token = get_title_page_token(parsed, type);
                if (token) {
                    prev = prev.concat(token.text.split('\n'));
                }
                return prev;
            };

            var left_side = print.title_page.left_side.reduce(concat_types.bind(null, parsed), []),
                right_side = print.title_page.right_side.reduce(concat_types.bind(null, parsed), []),
                title_page_extra = function(x) {
                    return function(line) {
                        writer.text(line.trim(), x, title_y);
                        title_page_next_line();
                    };
                };

            title_y = 8.5;
            left_side.forEach(title_page_extra(1.3));

            title_y = 8.5;
            right_side.forEach(title_page_extra(5));
        }

        var y = 0,
            page = 1,
            scene_number,
            prev_scene_continuation_header = '',
            scene_continuations = {},
            current_section_level = 0,
            current_section_number,
            current_section_token,
            section_number = helper.version_generator(),
            text,
            after_section = false;

        var print_header_and_footer = function(continuation_header) {
            if (cfg.print_header) {
                continuation_header = continuation_header || '';
                var offset = helper.blank_text(continuation_header);
                if (helper.get_indentation(cfg.print_header).length >= continuation_header.length) {
                    offset = '';
                }
                if (offset) {
                    offset += ' ';
                }
                writer.format_text(offset + cfg.print_header, 1.5, print.page_number_top_margin, {
                    color: '#777777'
                });
            }
            if (cfg.print_footer) {
                writer.format_text(cfg.print_footer, 1.5, print.page_height - 0.5, {
                    color: '#777777'
                });
            }
        };

        var print_watermark = function() {
            if (cfg.print_watermark) {
                var watermark = cfg.print_watermark.replace(/_/g, '').replace(/\*/g, ''),
                    angle = -Math.atan(print.page_height / print.page_width) * 180 / Math.PI,
                    diagonal = Math.sqrt(Math.pow(print.page_width, 2) + Math.pow(print.page_height, 2)) - 4,
                    font_size = (1.667 * diagonal) / watermark.length; // in inches

                writer.raw('<div class="sp-watermark" style="font-size:' + inches(font_size) +
                    ';transform:translate(-50%, -50%) rotate(' + angle.toFixed(2) + 'deg)">' +
                    escape_html(watermark) + '</div>');
            }
        };

        writer.addPage();
        print_watermark();
        print_header_and_footer();

        lines.forEach(function(line) {
            if (line.type === "page_break") {

                if (cfg.scene_continuation_bottom && line.scene_split) {
                    var scene_continued_text = '(' + (cfg.text_scene_continued || 'CONTINUED') + ')';
                    var feed = print.action.feed + print.action.max * print.font_width - scene_continued_text.length * print.font_width;
                    writer.simple_text(scene_continued_text, feed, print.top_margin + print.font_height * (y + 2));
                }

                y = 0;
                writer.addPage();
                page++;

                var number_y = print.page_number_top_margin;

                if (cfg.scene_continuation_top && line.scene_split) {
                    scene_continuations[scene_number] = scene_continuations[scene_number] || 0;
                    scene_continuations[scene_number]++;

                    var scene_continued = (cfg.scenes_numbers !== 'none' && scene_number ? scene_number + ' ' : '') + (cfg.text_scene_continued || 'CONTINUED') + ':';
                    scene_continued += scene_continuations[scene_number] > 1 ? ' (' + scene_continuations[scene_number] + ')' : '';

                    scene_continued = scene_continued.replace(/\*/g, '');
                    scene_continued = scene_continued.replace(/_/g, '');
                    writer.simple_text(scene_continued, print.action.feed, number_y);
                    prev_scene_continuation_header = scene_continued;
                }

                if (cfg.show_page_numbers) {
                    var page_num = page.toFixed() + ".";
                    var number_x = print.action.feed + print.action.max * print.font_width - page_num.length * print.font_width;
                    writer.simple_text(page_num, number_x, number_y);
                }
                print_watermark();
                print_header_and_footer(prev_scene_continuation_header);
                prev_scene_continuation_header = '';

            } else if (line.type === "separator") {
                y++;
            } else {
                text = line.text || '';

                var color = (print[line.type] && print[line.type].color) || '#000000';
                var text_properties = {
                    color: color,
                    line: token_line(line)
                };

                if (line.type === 'centered') {
                    center(text, print.top_margin + print.font_height * y++, text_properties);
                } else {
                    var feed = (print[line.type] || {}).feed || print.action.feed;
                    if (line.type === "transition") {
                        feed = print.action.feed + print.action.max * print.font_width - text.length * print.font_width;
                    }
                    if (line.type === "scene_heading" && cfg.embolden_scene_headers) {
                        text = '**' + text + '**';
                    }
                    if (line.type === "scene_heading" && cfg.underline_scene_headers) {
                        text = '_' + text + '_';
                    }

                    if (line.type === 'section') {
                        current_section_level = line.token.level;
                        feed += current_section_level * print.section.level_indent;
                        if (cfg.number_sections) {
                            if (line.token !== current_section_token) {
                                current_section_number = section_number(line.token.level);
                                current_section_token = line.token;
                                text = current_section_number + '. ' + text;
                            } else {
                                text = Array(current_section_number.length + 3).join(' ') + text;
                            }
                        }
                    } else if (line.type === 'synopsis') {
                        feed += print.synopsis.padding || 0;
                        if (print.synopsis.feed_with_last_section && after_section) {
                            feed += current_section_level * print.section.level_indent;
                        } else {
                            feed = print.action.feed;
                        }
                    }

                    if (print[line.type] && print[line.type].italic && text) {
                        text = '*' + text + '*';
                    }

                    if (line.token && line.token.dual) {
                        if (line.right_column) {
                            var y_right = y;
                            line.right_column.forEach(function(line) {
                                var feed_right = (print[line.type] || {}).feed || print.action.feed;
                                feed_right -= (feed_right - print.left_margin) / 2;
                                feed_right += (print.page_width - print.right_margin - print.left_margin) / 2;
                                writer.text(line.text || '', feed_right, print.top_margin + print.font_height * y_right++, {
                                    color: color,
                                    line: token_line(line)
                                });
                            });
                        }

                        feed -= (feed - print.left_margin) / 2;
                    }

                    writer.text(text, feed, print.top_margin + print.font_height * y, text_properties);

                    if (line.number) {
                        scene_number = String(line.number);
                        var scene_text_length = scene_number.length;
                        if (cfg.embolden_scene_headers) {
                            scene_number = '**' + scene_number + '**';
                        }
                        if (cfg.underline_scene_headers) {
                            scene_number = '_' + scene_number + '_';
                        }

                        var shift_scene_number;

                        if (cfg.scenes_numbers === 'both' || cfg.scenes_numbers === 'left') {
                            shift_scene_number = (scene_text_length + 4) * print.font_width;
                            writer.text(scene_number, feed - shift_scene_number, print.top_margin + print.font_height * y, text_properties);
                        }

                        if (cfg.scenes_numbers === 'both' || cfg.scenes_numbers === 'right') {
                            shift_scene_number = (print.scene_heading.max + 1) * print.font_width;
                            writer.text(scene_number, feed + shift_scene_number, print.top_margin + print.font_height * y, text_properties);
                        }
                    }

                    y++;
                }
            }

            if (line.type === 'section') {
                after_section = true;
            } else if (line.type !== 'separator' && line.type !== 'synopsis' && line.type !== 'page_break') {
                after_section = false;
            }
        });
    }

    /**
     * Render parsed script to an HTML string
     *
     * @param {Object} opts
     * @param {Object} opts.parsed - parsed script (with lines)
     * @param {Object} opts.print - print profile
     * @param {Object} opts.config - print config (same as passed to pdfmaker)
     * @returns {{html: string, pages: number}}
     */
    module.render = function(opts) {
        var print = opts.print,
            writer = createWriter(print);

        generate(writer, opts);

        var page_style = 'width:' + inches(print.page_width) + ';height:' + inches(print.page_height) +
            ';font-size:' + inches((print.font_size || 12) / 72) + ';line-height:' + inches(print.font_height);

        var pages = writer.getPages();
        var html = pages.map(function(page) {
            return '<div class="sp-page ' + page.className + '" style="' + page_style + '">' + page.html.join('') + '</div>';
        }).join('');

        return {
            html: html,
            pages: pages.length
        };
    };

    return module;
});
