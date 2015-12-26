'use strict';

var co = require('co-utils');

class CoTasks {
    constructor() {
        /**
         * Tasks storage
         * @type {Object}
         */
        this.tasks = {};

        /**
         * Predefined task names
         * @type {Array}
         * @default null
         */
        this.allowedTasks = null;
    }

    /**
     * Runs tasks in series.
     * @method run
     *
     * @param {String|Array} [tasks] Task name to be run. If this is not set, all tasks will be run
     * @return {Object} Returns a promise
     */
    run(tasks) {
        if (!tasks) {
            tasks = this.allowedTasks;
        }
        else if (typeof tasks === 'string') {
            tasks = [tasks];
        }

        return co(function* () {
            for (let task of tasks) {
                if (!this.tasks[task]) {
                    throw new Error('Task name ' + task + ' not defined!');
                }

                if (this.tasks['pre-' + task].length) {
                    yield co.series(this.tasks['pre-' + task]);
                }

                if (this.tasks[task].length) {
                    yield co.series(this.tasks[task]);
                }

                if (this.tasks['post-' + task].length) {
                    yield co.series(this.tasks['post-' + task]);
                }
            }
        }.bind(this));
    }

    /**
     * Registers a task
     * @chainable
     * @method registerTask
     *
     * @param {String} name, Task name
     * @param {Function|Object} fn Task function or object.
     * @return {Object} Returns this.
     */
    registerTask(name, fn) {
        if (!this.tasks[name]) {
            if (this.allowedTasks) {
                throw new Error('Task name ' + name + ' not defined!\nAllowed tasks are: ' + Object.keys(this.tasks).join(', '));
            }

            this.tasks[name] = [];
        }

        this.tasks[name].push(fn);
    }

    /**
     * Predefine task names
     *
     * @method defineTasks
     * @chainable
     *
     * @param {Array} Array of predefined tasks.
     * @return {Object} Returns this value
     */
    defineTasks(tasks, regPreTasks, regPostTasks) {
        this.allowedTasks = [];
        for (let task of tasks) {
            if (regPreTasks) {
                this.tasks['pre-' + task] = [];
            }

            this.tasks[task] = [];
            this.allowedTasks.push(task);

            if (regPostTasks) {
                this.tasks['post-' + task] = [];
            }
        }
    }
}

module.exports = CoTasks;
