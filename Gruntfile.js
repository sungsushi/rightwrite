module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: ['dist', 'rightwrite.zip'],
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
        },

        // offline version: unzip and open index.html
        compress: {
            release: {
                options: {
                    archive: 'rightwrite.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**'],
                    dest: 'rightwrite'
                }]
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
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('samples', ['handlebars:samples']);

    grunt.registerTask('build', [
        'clean:build',
        'samples',
        'concat:bootstrap',
        'requirejs',
        'uglify',
        'concat:codemirror',
        'cssmin',
        'copy',
        'compress',
        'clean:temp'
    ]);

    grunt.registerTask('default', ['build']);
};
