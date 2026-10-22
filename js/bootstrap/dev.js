/**
 * Development bootstrap (dev.html): loads modules directly from js/ without a build step.
 */
require(['dependencies', 'bootstrap', 'bootstrap/app-config'], function (_, Bootstrap, AppConfig) {
    Bootstrap.init(AppConfig);
});
