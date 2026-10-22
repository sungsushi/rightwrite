/**
 * The live HTML preview must match the exported PDF: same number of pages, and on each page
 * the same text runs at the same horizontal positions.
 */
var test = require('node:test'),
    assert = require('node:assert'),
    helpers = require('./helpers');

var SAMPLES = ['brick_and_steel', 'my_living_memory', 'printing_trouble'],
    PROFILES = ['a4', 'usletter'],
    CONFIGS = {
        'default settings': {
            print_title_page: true,
            show_page_numbers: true,
            scenes_numbers: 'none'
        },
        'scene numbers and continuations': {
            print_title_page: true,
            show_page_numbers: true,
            scenes_numbers: 'both',
            scene_continuation_top: true,
            scene_continuation_bottom: true,
            embolden_scene_headers: true
        },
        'no title page, header and footer': {
            print_title_page: false,
            show_page_numbers: true,
            print_header: 'DRAFT',
            print_footer: 'Confidential'
        }
    };

// positions are computed independently in inches; allow for float rounding (A4 width is 8.27")
var TOLERANCE = 0.011;

function unmatched(from, to) {
    var remaining = to.slice();
    return from.filter(function(run) {
        var index = remaining.findIndex(function(candidate) {
            return candidate.text === run.text && Math.abs(candidate.x - run.x) < TOLERANCE;
        });
        if (index === -1) {
            return true;
        }
        remaining.splice(index, 1);
        return false;
    });
}

SAMPLES.forEach(function(sample) {
    PROFILES.forEach(function(profile) {
        Object.keys(CONFIGS).forEach(function(configName) {
            test(sample + ' / ' + profile + ' / ' + configName, function() {
                return helpers.renderBoth(helpers.readSample(sample), profile, CONFIGS[configName]).then(function(result) {
                    assert.strictEqual(result.htmlPages, result.pdfPages, 'page count');

                    result.html.forEach(function(htmlRuns, page) {
                        var pdfRuns = result.pdf[page];
                        assert.deepStrictEqual(unmatched(htmlRuns, pdfRuns), [], 'page ' + (page + 1) + ': text only in preview');
                        assert.deepStrictEqual(unmatched(pdfRuns, htmlRuns), [], 'page ' + (page + 1) + ': text only in PDF');
                    });
                });
            });
        });
    });
});
