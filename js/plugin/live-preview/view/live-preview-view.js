define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('core/view/section-view-mixin'),
        LivePreviewViewPresenter = require('plugin/live-preview/view/live-preview-view-presenter');

    var PAGE_GUTTER = 48, // horizontal space around the page in px
        MAX_PIXELS_PER_INCH = 96,
        PAGE_INDICATOR_DELAY = 1200; // ms the page number stays visible after scrolling stops

    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: LivePreviewViewPresenter
        },

        hbs: '<div class="live-preview">' +
            '<div class="live-preview-page-anchor"><div class="live-preview-page-indicator" aria-hidden="true"></div></div>' +
            '<div class="live-preview-pages"></div>' +
            '<p class="live-preview-empty">Start writing on the left. The formatted script appears here.</p>' +
            '</div>',

        /**
         * Page width in inches (from the print profile), used to fit the page to the pane
         */
        pageWidth: 8.5,

        $preview: null,

        $pages: null,

        $empty: null,

        $pageIndicator: null,

        _pageIndicatorTimer: null,

        _pageIndicatorFrame: null,

        addBindings: function() {
            Protoplast.utils.bind(this, 'pageWidth', this.updateSize);
        },

        addInteractions: function() {
            this.root.className = 'live-preview-scroll';
            this.$preview = this._wrapSelector('.live-preview');
            this.$pages = this._wrapSelector('.live-preview-pages');
            this.$empty = this._wrapSelector('.live-preview-empty');
            this.$pageIndicator = this._wrapSelector('.live-preview-page-indicator');

            this._wrapElement(this.root).on('scroll', function() {
                if (!this._pageIndicatorFrame) {
                    this._pageIndicatorFrame = window.requestAnimationFrame(this._showPageIndicator.bind(this));
                }
            }.bind(this));

            this.$pages.on('click', '.sp-line[data-line]', function(event) {
                this.dispatch('lineClicked', parseInt($(event.currentTarget).attr('data-line'), 10));
            }.bind(this));
        },

        /**
         * @param {string} html - rendered pages
         * @param {boolean} isEmpty - true if the script has no content
         */
        render: function(html, isEmpty) {
            var scrollTop = this.root.scrollTop;
            this.$pages.html(isEmpty ? '' : html);
            this.$empty.toggle(isEmpty);
            this.root.scrollTop = scrollTop;
        },

        /**
         * Show "Page X of Y" for the page in the middle of the pane, then hide it once scrolling stops
         */
        _showPageIndicator: function() {
            this._pageIndicatorFrame = null;

            var pages = this.$pages.get(0).children,
                middle = this.root.getBoundingClientRect().top + this.root.clientHeight / 2,
                current = pages.length;

            if (!pages.length) {
                return;
            }

            for (var i = 0; i < pages.length; i++) {
                if (pages[i].getBoundingClientRect().bottom >= middle) {
                    current = i + 1;
                    break;
                }
            }

            this.$pageIndicator.text('Page ' + current + ' of ' + pages.length).addClass('is-visible');

            clearTimeout(this._pageIndicatorTimer);
            this._pageIndicatorTimer = setTimeout(function() {
                this.$pageIndicator.removeClass('is-visible');
            }.bind(this), PAGE_INDICATOR_DELAY);
        },

        updateSize: function() {
            if (!this.$preview) {
                return;
            }
            var available = this.root.clientWidth - PAGE_GUTTER,
                pixelsPerInch = Math.min(MAX_PIXELS_PER_INCH, Math.max(20, available / this.pageWidth));
            this.$preview.get(0).style.setProperty('--u', pixelsPerInch.toFixed(2) + 'px');
        }

    });
});
