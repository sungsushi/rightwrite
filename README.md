# right*write*

A minimal screenplay editor that runs in your browser. Write in [Fountain](https://fountain.io) on the left,
see the formatted script on the right, and export a PDF when you're ready.

### ▶ [Open rightwrite in your browser](https://sungsushi.github.io/rightwrite/)

### ⬇ [Download rightwrite.html](https://github.com/sungsushi/rightwrite/releases/latest/download/rightwrite.html) — works offline

The download is a single HTML file with everything built in. Save it anywhere and double-click it to open
rightwrite in your browser, no internet connection or installation needed.
Older versions are on the [releases page](https://github.com/sungsushi/rightwrite/releases).

---

- **Live preview, not a PDF viewer.** The script is rendered as HTML pages with the same pagination,
  positions and page breaks as the exported PDF. It updates 3 seconds after you stop typing.
- **Print-accurate.** A4 or US Letter, title page, dual dialogue, scene numbers, `(MORE)`/`(CONT'D)`,
  scene continuations, headers, footers and watermarks — the preview and the PDF come from the same layout rules,
  and the test suite checks they match page by page.
- **Private and offline.** Everything runs locally in the browser. Your script is never uploaded; the last
  script is kept in the browser's storage so it's there when you come back.
- **Everything else is in the Options menu:** open `.fountain`, `.txt` and Final Draft `.fdx` files, save as
  `.fountain`, export PDF, settings, facts, stats and sample scripts.

Click any line in the preview to jump to it in the editor. Drag the divider to resize the panes.

## Getting started

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:8000/dev.html>. The development page loads the source files from `js/` directly, so
changes show up on reload without a build.

### Build

```bash
npm run build
```

This creates `dist/`:

- `index.html` + `bundle/` — the site, ready to host on any static web server
- `rightwrite.html` — the single-file version (app, styles and fonts inlined, about 4 MB) for offline use

`npm start` serves the repository, with the built site at <http://localhost:8000/dist/>.

### Publishing

- **Website:** every push to `main` builds the site and deploys it to GitHub Pages
  (`.github/workflows/pages.yml`). In the repository settings, set *Pages → Build and deployment → Source* to
  *GitHub Actions*.
- **Download:** pushing a version tag creates a GitHub release with `rightwrite.html` attached
  (`.github/workflows/release.yml`):

  ```bash
  git tag v0.1.0
  git push origin v0.1.0
  ```

### Test

```bash
npm run lint
npm test
```

The tests run in Node (no browser needed). Besides unit tests for the HTML renderer, they render the sample
scripts both as HTML and as PDF with several settings and paper sizes, and check that every page contains the
same text at the same positions.

## Browser support

Any current browser works. **Save as .fountain** and **Export PDF** use the system "Save as" dialog
(File System Access API) in Chrome, Edge and other Chromium-based browsers; Firefox and Safari ask for a
file name and save to the downloads folder.

## How it works

The app is written in plain JavaScript (AMD modules loaded with RequireJS) on top of a small dependency-injection
framework, [Protoplast](https://github.com/ifrost/protoplast).

```
js/
├── bootstrap/          app configuration: which theme and plugins are loaded
├── core/               script model (parsing, pagination), settings, PDF controller, base classes
├── theme/minimal/      layout: top bar, Options menu, editor/preview split, centred panels
├── plugin/
│   ├── editor/         CodeMirror editor with Fountain syntax highlighting
│   ├── live-preview/   HTML preview, re-rendered 3 s after typing stops
│   ├── io/             open, save .fountain, export PDF
│   ├── settings/       print and layout settings
│   ├── stats/          facts and charts
│   └── info/           about box
└── utils/
    ├── liner.js        splits the parsed script into lines and pages
    ├── htmlmaker.js    renders pages as HTML (preview)
    └── pdfmaker.js     renders pages as PDF (PDFKit)
```

`htmlmaker.js` mirrors `pdfmaker.js`: both position every line in inches from the same print profile
(`utils/print-profiles.js`). The preview sets a CSS variable `--u` (pixels per inch) to fit the page to the pane,
so zooming doesn't require re-rendering.

## Credits

right*write* is built on [’afterwriting](https://github.com/ifrost/afterwriting-labs) by Piotr Jamróz,
released under the MIT licence. The Fountain parser is [aw-parser](https://www.npmjs.com/package/aw-parser).

- [Fountain](https://fountain.io) screenplay format
- [Courier Prime](https://quoteunquoteapps.com/courierprime/) by Quote-Unquote Apps (SIL Open Font License) and
  [Courier Prime Cyrillic](http://dimkanovikov.pro/courierprime/)
- Sample scripts: *Brick & Steel* by Stu Maschwitz; *My Living Memory* and *Printing Trouble* by Dan Rahmel
- Libraries: [CodeMirror](https://codemirror.net), [PDFKit](https://pdfkit.org), [jQuery](https://jquery.com),
  [d3](https://d3js.org), [Handlebars](https://handlebarsjs.com), [RequireJS](https://requirejs.org),
  [jQuery Impromptu](https://trentrichardson.com/Impromptu/), [FileSaver.js](https://github.com/eligrey/FileSaver.js)

## License

[MIT](LICENSE)
