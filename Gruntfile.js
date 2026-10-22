module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: ['dist'],
            temp: ['js/rightwrite-bootstrap.js']
        },

        // compile sample scripts into an AMD module (samples/compiled.js) used by the Options menu
        handlebars: {
            samples: {
                options: {
                    amd: true
                },
                files: {
                    'samples/compiled.js': ['samples/*.fountain']
                }
            }
        },

        concat: {
            bootstrap: {
                options: {
                    separator: ''
                },
                src: ['js/main.js', 'js/bootstrap/index.js'],
                dest: 'js/rightwrite-bootstrap.js'
            },
            // CodeMirror is appended after optimisation (it does not survive the RequireJS optimiser)
            codemirror: {
                options: {
                    separator: ';'
                },
                src: ['dist/bundle/js/rightwrite.js', 'js/libs/codemirror/lib/codemirror.js'],
                dest: 'dist/bundle/js/rightwrite.js'
            }
        },

        requirejs: {
            compile: {
                options: {
                    optimize: 'none',
                    baseUrl: 'js',
                    mainConfigFile: 'js/rightwrite-bootstrap.js',
                    include: ['libs/require', 'rightwrite-bootstrap'],
                    out: 'dist/bundle/js/rightwrite.js',
                    onBuildWrite: function(moduleName, path, contents) {
                        return moduleName === 'libs/codemirror/lib/codemirror' ? '' : contents;
                    }
                }
            }
        },

        // mangle only: uglify's compressor combined with mangling breaks Protoplast's class metadata
        uglify: {
            options: {
                compress: false
            },
            bundle: {
                files: {
                    'dist/bundle/js/rightwrite.js': ['dist/bundle/js/rightwrite.js']
                }
            }
        },

        cssmin: {
            bundle: {
                files: {
                    'dist/bundle/css/rightwrite.css': [
                        'css/reset.css',
                        'css/codemirror.css',
                        'css/jquery-impromptu.min.css',
                        'js/libs/codemirror/addon/hint/show-hint.css',
                        'css/minimal.css'
                    ]
                }
            }
        },

        copy: {
            html: {
                src: 'html/index.html',
                dest: 'dist/index.html'
            },
            favicon: {
                src: 'favicon.svg',
                dest: 'dist/favicon.svg'
            },
            fonts: {
                expand: true,
                src: ['fonts/**'],
                dest: 'dist/bundle'
            },
            pdfFonts: {
                expand: true,
                flatten: true,
                src: ['js/fonts/courier-prime*.js'],
                dest: 'dist/bundle/js/fonts'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('samples', ['handlebars:samples']);

    /**
     * Single-file version for offline use: dist/rightwrite.html with the app, styles, web fonts,
     * PDF fonts and favicon inlined. Needs the built site in dist/.
     */
    grunt.registerTask('standalone', 'Create dist/rightwrite.html (single file, works offline)', function() {
        var read = function(path) {
                return grunt.file.read(path);
            },
            base64 = function(path) {
                return require('fs').readFileSync(path).toString('base64');
            },
            // inline <script> content must not close the tag early
            safeScript = function(js) {
                return js.replace(/<\/(script)/gi, '<\\/$1');
            };

        var css = read('dist/bundle/css/rightwrite.css').replace(/url\((['"]?)\.\.\/fonts\/([^)'"]+\.ttf)\1\)/g, function(match, quote, file) {
            return 'url(data:font/ttf;base64,' + base64('dist/bundle/fonts/' + file) + ')';
        });

        // PDF fonts become named modules ("fonts/courier-prime") that the font loader requires directly
        var pdfFonts = grunt.file.expand('js/fonts/courier-prime*.js').map(function(path) {
            var id = 'fonts/' + path.split('/').pop().replace(/\.js$/, '');
            return '<script>' + safeScript(read(path).replace(/^\s*define\(\s*function/, 'define(\'' + id + '\', function')) + '</script>';
        }).join('\n');

        var favicon = 'data:image/svg+xml;base64,' + base64('favicon.svg');

        var html = read('html/index.html')
            .replace(/<link rel="icon"[^>]*>/, '<link rel="icon" type="image/svg+xml" href="' + favicon + '">')
            .replace(/<link rel="stylesheet"[^>]*>/, function() {
                return '<style>' + css + '</style>';
            })
            .replace(/<script src="bundle\/js\/rightwrite\.js" defer><\/script>\n?/, '')
            .replace('</body>', function() {
                return '<script>window.RIGHTWRITE_STANDALONE = true;</script>\n' +
                    '<script>' + safeScript(read('dist/bundle/js/rightwrite.js')) + '</script>\n' +
                    pdfFonts + '\n</body>';
            });

        grunt.file.write('dist/rightwrite.html', html);
        grunt.log.ok('dist/rightwrite.html (' + (html.length / 1024 / 1024).toFixed(1) + ' MB)');
    });

    grunt.registerTask('build', [
        'clean:build',
        'samples',
        'concat:bootstrap',
        'requirejs',
        'uglify',
        'concat:codemirror',
        'cssmin',
        'copy',
        'standalone',
        'clean:temp'
    ]);

    grunt.registerTask('default', ['build']);
};
