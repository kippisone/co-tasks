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

    taskRunnner.registerTask('foo', function(arg1, arg2, done) {
        done();
    });

    taskRunnner.registerTask('bar', function(arg1, arg2, promise) {
        return promise;
    });

    taskRunnner.registerTask('bar', Promise(function(resolve, reject) {

    });

    taskRunnner.registerTask('bla', function *(arg1, arg2) {

    });
};
