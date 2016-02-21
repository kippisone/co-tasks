'use strict';

module.exports = function(taskRunnner) {
    taskRunnner.registerTask('bla', function(done) {
        done('a');
    });

    taskRunnner.registerTask('bla', function() {
        return new Promise(function(resolve, reject) {
            resolve('b');
        });
    });

    taskRunnner.registerTask('bla', function *() {
        return 'c';
    });

    taskRunnner.registerTask('bla', function(promise) {
        promise.resolve('d');
    });
};
