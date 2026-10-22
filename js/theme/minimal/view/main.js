define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        MainPresenter = require('theme/minimal/presenter/main-presenter');

    var SPLIT_STORAGE_KEY = 'rightwrite.split',
        MIN_PANE_PERCENT = 20,
        MAX_PANE_PERCENT = 80;

    var MENU_ITEMS = [
        {action: 'new', label: 'New script'},
        {action: 'open', label: 'Open…', shortcut: 'O'},
        {action: 'save', label: 'Save as .fountain…', shortcut: 'S'},
        {action: 'pdf', label: 'Export PDF…'},
        {separator: true},
        {action: 'settings', label: 'Settings'},
        {action: 'facts', label: 'Facts'},
        {action: 'stats', label: 'Stats'},
        {separator: true},
        {heading: 'Samples'},
        {action: 'sample', value: 'brick_and_steel', label: 'Brick & Steel'},
        {action: 'sample', value: 'my_living_memory', label: 'My Living Memory'},
        {action: 'sample', value: 'printing_trouble', label: 'Printing Trouble'},
        {separator: true},
        {action: 'info', label: 'About'}
    ];

    var STATUS_LABELS = {
        idle: '',
        pending: 'Preview updates when you pause',
        ready: 'Preview up to date',
        error: 'Preview could not be rendered'
    };

    var shortcutPrefix = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+';

    var menuHtml = MENU_ITEMS.map(function(item) {
        if (item.separator) {
            return '<li class="mn-menu-separator" role="separator"></li>';
        }
        if (item.heading) {
            return '<li class="mn-menu-heading">' + item.heading + '</li>';
        }
        return '<li role="none"><button role="menuitem" class="mn-menu-item" data-action="' + item.action + '"' +
            (item.value ? ' data-value="' + item.value + '"' : '') + '>' +
            '<span>' + item.label + '</span>' +
            (item.shortcut ? '<kbd>' + shortcutPrefix + item.shortcut + '</kbd>' : '') +
            '</button></li>';
    }).join('');

    var Main = Protoplast.Component.extend({

        $meta: {
            presenter: MainPresenter
        },

        html: '<div class="mn-app">' +
            '<header class="mn-topbar">' +
                '<div class="mn-brand">right<em>write</em></div>' +
                '<div class="mn-title" data-prop="titleElement"></div>' +
                '<div class="mn-status" data-prop="statusElement" aria-live="polite"></div>' +
                '<div class="mn-options">' +
                    '<button class="mn-options-button" data-prop="optionsButton" aria-haspopup="true" aria-expanded="false">' +
                        'Options <span class="mn-burger" aria-hidden="true"></span>' +
                    '</button>' +
                    '<ul class="mn-menu" data-prop="menuElement" role="menu">' + menuHtml + '</ul>' +
                '</div>' +
            '</header>' +
            '<div class="mn-split" data-prop="splitElement">' +
                '<div data-comp="editorPane"></div>' +
                '<div class="mn-divider" data-prop="dividerElement" role="separator" aria-orientation="vertical" title="Drag to resize"></div>' +
                '<div data-comp="previewPane"></div>' +
            '</div>' +
            '<div class="mn-panel-backdrop" data-prop="panelElement">' +
                '<div class="mn-panel" role="dialog" aria-modal="true">' +
                    '<header class="mn-panel-header">' +
                        '<h2 data-prop="panelTitle"></h2>' +
                        '<button class="mn-panel-close" data-prop="panelClose" aria-label="Close">×</button>' +
                    '</header>' +
                    '<div data-comp="panelBody"></div>' +
                '</div>' +
            '</div>' +
            '<input type="file" class="mn-file-input" data-prop="fileInput" accept=".fountain,.txt,.fdx,.spmd">' +
            '</div>',

        editorPane: {
            component: Protoplast.Component.extend({html: '<section class="mn-pane mn-pane-editor"></section>'})
        },

        previewPane: {
            component: Protoplast.Component.extend({html: '<section class="mn-pane mn-pane-preview"></section>'})
        },

        panelBody: {
            component: Protoplast.Component.extend({html: '<div class="mn-panel-body content plugin-contents"></div>'})
        },

        /**
         * Sections displayed in the panes
         */
        editorSection: null,

        previewSection: null,

        /**
         * Panel content holders, by section name
         */
        _panelHolders: null,

        _menuOpen: false,

        $create: function() {
            this._panelHolders = {};
        },

        init: function() {
            this._restoreSplit();

            $(this.optionsButton).on('click', function(event) {
                event.stopPropagation();
                this.toggleMenu();
            }.bind(this));

            $(this.menuElement).on('click', '.mn-menu-item', function(event) {
                var $item = $(event.currentTarget);
                this.toggleMenu(false);
                this.dispatch('menuAction', {
                    action: $item.attr('data-action'),
                    value: $item.attr('data-value')
                });
            }.bind(this));

            $(document).on('click.minimal', function(event) {
                if (this._menuOpen && !$(event.target).closest('.mn-options').length) {
                    this.toggleMenu(false);
                }
            }.bind(this));

            $(document).on('keydown.minimal', this._onKeyDown.bind(this));

            $(this.panelClose).on('click', this.dispatch.bind(this, 'panelClosed'));
            $(this.panelElement).on('mousedown', function(event) {
                if (event.target === this.panelElement) {
                    this.dispatch('panelClosed');
                }
            }.bind(this));

            $(this.fileInput).on('change', function() {
                var file = this.fileInput.files[0];
                if (file) {
                    this.dispatch('fileSelected', file);
                }
                this.fileInput.value = '';
            }.bind(this));

            this._initDivider();

            $(window).on('resize.minimal', this.updateSize.bind(this));
        },

        setPinnedSections: function(editorSection, previewSection) {
            this.editorSection = editorSection;
            this.previewSection = previewSection;
            if (editorSection) {
                this._addSectionContent(this.editorPane, editorSection);
            }
            if (previewSection) {
                this._addSectionContent(this.previewPane, previewSection);
            }
            setTimeout(this.updateSize.bind(this), 0);
        },

        openFileDialog: function() {
            this.fileInput.click();
        },

        toggleMenu: function(open) {
            this._menuOpen = open === undefined ? !this._menuOpen : open;
            $(this.root).toggleClass('mn-menu-open', this._menuOpen);
            this.optionsButton.setAttribute('aria-expanded', String(this._menuOpen));
            if (this._menuOpen) {
                $(this.menuElement).find('.mn-menu-item').first().focus();
            }
        },

        setTitle: function(title) {
            this.titleElement.textContent = title || 'Untitled';
            document.title = (title ? title + ' – ' : '') + 'rightwrite';
        },

        setStatus: function(status) {
            this.statusElement.textContent = STATUS_LABELS[status] || '';
            this.statusElement.setAttribute('data-status', status);
        },

        /**
         * Show a section in the panel (or close the panel if section is null)
         */
        showPanel: function(section) {
            var holders = this._panelHolders;

            $(this.root).toggleClass('mn-panel-open', !!section);

            Object.keys(holders).forEach(function(name) {
                holders[name].root.style.display = section && section.name === name ? '' : 'none';
            });

            if (!section) {
                return;
            }

            this.panelTitle.textContent = section.title;
            this.panelElement.setAttribute('data-section', section.name);

            if (!holders[section.name]) {
                holders[section.name] = Protoplast.Component.extend({html: '<div class="mn-panel-section mn-panel-' + section.name + '"></div>'}).create();
                this.panelBody.add(holders[section.name]);
                this._addSectionContent(holders[section.name], section);
            }
            this.panelBody.root.scrollTop = 0;
        },

        /**
         * Section views expect the section to be set before they are initialised
         */
        _addSectionContent: function(parent, section) {
            section.mainContent.section = section;
            parent.add(section.mainContent);
        },

        updateSize: function() {
            [this.editorSection, this.previewSection].forEach(function(section) {
                if (section && section.mainContent && section.mainContent.updateSize) {
                    section.mainContent.updateSize();
                }
            });
            this.dispatch('resized');
        },

        _onKeyDown: function(event) {
            var modifier = event.metaKey || event.ctrlKey;

            if (event.key === 'Escape') {
                if (this._menuOpen) {
                    this.toggleMenu(false);
                    this.optionsButton.focus();
                } else if ($(this.root).hasClass('mn-panel-open')) {
                    this.dispatch('panelClosed');
                }
            } else if (modifier && !event.shiftKey && !event.altKey && (event.key === 's' || event.key === 'o')) {
                event.preventDefault();
                this.dispatch('menuAction', {action: event.key === 's' ? 'save' : 'open'});
            } else if (this._menuOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                event.preventDefault();
                var $items = $(this.menuElement).find('.mn-menu-item'),
                    index = $items.index(document.activeElement),
                    next = (index + (event.key === 'ArrowDown' ? 1 : -1) + $items.length) % $items.length;
                $items.eq(next).focus();
            }
        },

        _initDivider: function() {
            var $divider = $(this.dividerElement),
                split = this.splitElement,
                dragging = false;

            $divider.on('mousedown', function(event) {
                event.preventDefault();
                dragging = true;
                $(this.root).addClass('mn-resizing');
            }.bind(this));

            $(document).on('mousemove.minimal', function(event) {
                if (!dragging) {
                    return;
                }
                var rect = split.getBoundingClientRect(),
                    percent = (event.clientX - rect.left) / rect.width * 100;
                this._setSplit(percent);
            }.bind(this));

            $(document).on('mouseup.minimal', function() {
                if (dragging) {
                    dragging = false;
                    $(this.root).removeClass('mn-resizing');
                    this._saveSplit();
                    this.updateSize();
                }
            }.bind(this));

            $divider.on('dblclick', function() {
                this._setSplit(50);
                this._saveSplit();
                this.updateSize();
            }.bind(this));
        },

        _setSplit: function(percent) {
            percent = Math.max(MIN_PANE_PERCENT, Math.min(MAX_PANE_PERCENT, percent));
            this._splitPercent = percent;
            this.splitElement.style.setProperty('--editor-width', percent.toFixed(2) + '%');
            this.updateSize();
        },

        _saveSplit: function() {
            try {
                window.localStorage.setItem(SPLIT_STORAGE_KEY, String(this._splitPercent));
            } catch (e) {
                // storage not available, split is not remembered
            }
        },

        _restoreSplit: function() {
            var saved;
            try {
                saved = parseFloat(window.localStorage.getItem(SPLIT_STORAGE_KEY));
            } catch (e) {
                saved = NaN;
            }
            this._setSplit(isNaN(saved) ? 50 : saved);
        },

        destroy: function() {
            $(document).off('.minimal');
            $(window).off('.minimal');
            Protoplast.Component.destroy.call(this);
        }

    });

    return Main;
});
