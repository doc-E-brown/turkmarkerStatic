module.exports = function(grunt) {
    "use:strict";
    grunt.initConfig({
        qunit: {
            all: ["tests/qunit.html"],
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
};
