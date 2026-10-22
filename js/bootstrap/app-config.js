define(function(require) {

    var CoreConfig = require('bootstrap/core-config'),
        ThemeModel = require('theme/minimal/model/minimal-theme-model'),
        ThemeController = require('theme/minimal/controller/minimal-theme-controller'),
        Storage = require('core/model/storage'),
        InfoPlugin = require('plugin/info/info-plugin'),
        IoPlugin = require('plugin/io/io-plugin'),
        EditorPlugin = require('plugin/editor/editor-plugin'),
        StatsPlugin = require('plugin/stats/stats-plugin'),
        SettingsPlugin = require('plugin/settings/settings-plugin'),
        LivePreviewPlugin = require('plugin/live-preview/live-preview-plugin'),
        AppView = require('view/app-view');

    /**
     * Application config: core config + theme + plugins.
     *
     * The editor and the live preview are displayed side by side; open/save, PDF export,
     * settings, facts, stats and about are available in the Options menu.
     *
     * @module bootstrap/app-config
     * @augments module:bootstrap/core-config
     */
    var AppConfig = CoreConfig.extend({

        /**
         * Main view displayed when the config is loaded
         */
        MainView: {
            value: AppView
        },

        init: function(context) {
            CoreConfig.init.call(this, context);

            context.register(ThemeModel.create());
            context.register(ThemeController.create());
            context.register('storage', Storage.create());

            context.register(InfoPlugin.create(context));
            context.register(IoPlugin.create(context));
            context.register(EditorPlugin.create(context));
            context.register(StatsPlugin.create(context));
            context.register(SettingsPlugin.create(context));
            context.register(LivePreviewPlugin.create(context));
        }

    });

    return AppConfig;
});
