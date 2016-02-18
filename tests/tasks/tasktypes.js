'use strict';

module.exports = function(taskRunnner) {
    taskRunnner.registerTask('foo', function(done) {
        done();
    });

    taskRunnner.registerTask('bar', function() {
        return new Promise(function() {

        });
    });

    taskRunnner.registerTask('bar', Promise(function() {

    });

    taskRunnner.registerTask('bla', function *() {

    });
};
