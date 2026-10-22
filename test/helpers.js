/**
 * Helpers shared by the tests: parse a script, render it as HTML pages and as a PDF,
 * and extract positioned text runs from both so they can be compared.
 */
var fs = require('fs'),
    path = require('path'),
    load = require('./load');

var DEFAULT_PARSER_CONFIG = {
    print_headers: true,
    print_actions: true,
    print_dialogues: true,
    print_notes: false,
    print_sections: false,
    print_synopsis: false,
    each_scene_on_new_page: false,
    double_space_between_scenes: false,
    use_dual_dialogue: true,
    merge_multiple_empty_lines: true
};

var modulesPromise = load(['aw-parser', 'utils/liner', 'utils/print-profiles', 'utils/htmlmaker', 'utils/pdfmaker']);

function readSample(name) {
    return fs.readFileSync(path.join(__dirname, '..', 'samples', name + '.fountain'), 'utf8');
}

/**
 * Parse and paginate a script the same way ScriptModel does
 */
function parse(modules, script, profile, parserConfig) {
    var fparser = modules[0],
        Liner = modules[1],
        print = modules[2][profile];

    var parsed = fparser.parser.parse(script, Object.assign({}, DEFAULT_PARSER_CONFIG, parserConfig));
    parsed.lines = new Liner(fparser.helpers).line(parsed.tokens, {
        print: print,
        text_more: '(MORE)',
        text_contd: "(CONT'D)",
        split_dialogue: true
    });
    return parsed;
}

function decodeHtml(text) {
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/**
 * Extract text runs from rendered HTML: [[{text, x}]] per page, x in inches
 */
function htmlRuns(html, fontWidth) {
    return html.split('<div class="sp-page').slice(1).map(function(page) {
        var runs = [];
        var lineRe = /<div class="sp-line[^"]*"[^>]*style="left:calc\(var\(--u\) \* ([\d.-]+)\);top:calc\(var\(--u\) \* ([\d.-]+)\)">(.*?)<\/div>/g,
            match;
        while ((match = lineRe.exec(page)) !== null) {
            var x = parseFloat(match[1]),
                content = match[3],
                spanRe = /<span[^>]*>(.*?)<\/span>/g,
                span, hasSpans = false;
            while ((span = spanRe.exec(content)) !== null) {
                hasSpans = true;
                var text = decodeHtml(span[1]);
                runs.push({text: text, x: x});
                x += text.length * fontWidth;
            }
            if (!hasSpans) {
                runs.push({text: decodeHtml(content), x: x});
            }
        }
        return runs.filter(function(run) {
            return run.text.trim();
        });
    });
}

/**
 * Extract text runs from an uncompressed PDF made with the standard Courier font: [[{text, x}]] per page
 */
function pdfRuns(buffer) {
    var pdf = buffer.toString('latin1'),
        streams = pdf.split('stream\n').slice(1).map(function(chunk) {
            return chunk.split('\nendstream')[0];
        });

    return streams.filter(function(stream) {
        return stream.indexOf('BT') !== -1;
    }).map(function(stream) {
        var runs = [],
            textRe = /1 0 0 1 ([\d.-]+) ([\d.-]+) Tm\n\/F\d+ [\d.]+ Tf\n\[(.*?)\] TJ/g,
            match;
        while ((match = textRe.exec(stream)) !== null) {
            var hex = (match[3].match(/<([0-9a-f]*)>/g) || []).map(function(part) {
                return part.slice(1, -1);
            }).join('');
            runs.push({text: Buffer.from(hex, 'hex').toString('latin1'), x: parseFloat(match[1]) / 72});
        }
        return runs.filter(function(run) {
            return run.text.trim();
        });
    });
}

/**
 * Render a script both ways
 * @returns {Promise<{htmlPages: number, pdfPages: number, html: Array, pdf: Array}>}
 */
function renderBoth(script, profile, config, parserConfig) {
    return modulesPromise.then(function(modules) {
        var htmlmaker = modules[3],
            pdfmaker = modules[4],
            print = modules[2][profile];

        var html = htmlmaker.render({
            parsed: parse(modules, script, profile, parserConfig),
            print: print,
            config: config
        });

        return new Promise(function(resolve) {
            pdfmaker.get_pdf({
                parsed: parse(modules, script, profile, parserConfig),
                print: print,
                config: config,
                callback: resolve
            });
        }).then(function(result) {
            return result.blob.arrayBuffer();
        }).then(function(arrayBuffer) {
            var pdf = pdfRuns(Buffer.from(arrayBuffer));
            return {
                htmlPages: html.pages,
                pdfPages: pdf.length,
                html: htmlRuns(html.html, print.font_width),
                pdf: pdf,
                markup: html.html
            };
        });
    });
}

module.exports = {
    modules: modulesPromise,
    readSample: readSample,
    parse: parse,
    renderBoth: renderBoth
};
