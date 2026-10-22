var test = require('node:test'),
    assert = require('node:assert'),
    helpers = require('./helpers');

function render(script, config) {
    return helpers.modules.then(function(modules) {
        var htmlmaker = modules[3],
            print = modules[2].a4;
        return htmlmaker.render({
            parsed: helpers.parse(modules, script, 'a4'),
            print: print,
            config: Object.assign({print_title_page: true, show_page_numbers: true}, config)
        });
    });
}

test('escapes HTML in the script', function() {
    return render('INT. HOUSE - DAY\n\nShe types <b>bold</b> & "quotes".').then(function(result) {
        assert.ok(result.html.indexOf('&lt;b&gt;bold&lt;/b&gt; &amp;') !== -1);
        assert.ok(result.html.indexOf('<b>') === -1);
    });
});

test('renders Fountain emphasis as bold, italic and underline spans', function() {
    return render('INT. HOUSE - DAY\n\nThis is **bold**, *italic* and _underlined_.').then(function(result) {
        assert.match(result.html, /<span class="b">bold<\/span>/);
        assert.match(result.html, /<span class="i">italic<\/span>/);
        assert.match(result.html, /<span class="u">underlined<\/span>/);
    });
});

test('emphasis spanning wrapped lines stays open on the next line', function() {
    var longItalic = '*' + new Array(30).join('word ') + 'end*';
    return render('INT. HOUSE - DAY\n\n' + longItalic).then(function(result) {
        var italicLines = result.html.match(/<div class="sp-line"[^>]*><span class="i">/g) || [];
        assert.ok(italicLines.length >= 2, 'expected the italic action to wrap over two lines');
    });
});

test('skips the title page when the script has no title page', function() {
    return render('INT. HOUSE - DAY\n\nAction.').then(function(result) {
        assert.strictEqual(result.pages, 1);
        assert.ok(result.html.indexOf('sp-title-page') === -1);
    });
});

test('renders the title page', function() {
    return render('Title: My Script\nAuthor: Someone\n\nINT. HOUSE - DAY\n\nAction.').then(function(result) {
        assert.strictEqual(result.pages, 2);
        assert.ok(result.html.indexOf('sp-title-page') !== -1);
        assert.ok(result.html.indexOf('MY SCRIPT') !== -1, 'title is capitalised');
    });
});

test('links lines to their source line in the editor', function() {
    return render('INT. HOUSE - DAY\n\nAction.').then(function(result) {
        assert.match(result.html, /data-line="0"[^>]*><span>INT\. HOUSE - DAY<\/span>/);
        assert.match(result.html, /data-line="2"/);
    });
});

test('positions are expressed in inches relative to --u', function() {
    return render('INT. HOUSE - DAY\n\nAction.').then(function(result) {
        // A4 page, action starts 1.5" from the left edge
        assert.match(result.html, /width:calc\(var\(--u\) \* 8\.2700\)/);
        assert.match(result.html, /left:calc\(var\(--u\) \* 1\.5000\)/);
    });
});
