'use strict';

var path = require('path');
var co = require('co-utils');
var glob = require('glob');
var log = require('logtopus');

class CoTasks {
    /**
     * CoTasks constructor
     *
     * conf: {
     *     tasksDir: {string} Path to tasks directory,
     *     debug: {boolean} enables debug mode
     * }
     * 
     * @method constructor
     * @param  {object}    [conf] Conf object
     */
    constructor(conf) {
        conf = conf || {};

        if (conf.debug) {
            log.setLevel('debug');            
        }

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


        if (conf && conf.tasksDir) {
            this.registerTasksDir(conf.tasksDir);
        }
    }

    /**
     * Runs tasks in series.
     * @method run
     *
     * @param {String|Array} [tasks] Task name to be run. If this is not set, all tasks will be run
     * @return {Object} Returns a promise
     */
    run(tasks, ctx, args) {
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

                if (this.tasks['pre-' + task] && this.tasks['pre-' + task].length) {
                    yield co.series(this.tasks['pre-' + task].bind(ctx));
                }

                if (this.tasks[task] && this.tasks[task].length) {
                    yield co.series(this.tasks[task].bind(ctx));
                }

                if (this.tasks['post-' + task] && this.tasks['post-' + task].length) {
                    yield co.series(this.tasks['post-' + task].bind(ctx));
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
        log.debug('Register new task', name);
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

    /**
     * Registers a tasks dir
     * @method registerTasksDir
     * @param {string} dir Dir name
     * @returns {object} Returns a promise
     */
    registerTasksDir(dir) {
        log.debug('Register tasks dir', dir);
        var self = this;
        var files = glob.sync(path.join(dir, '**/*.js'));
        for (let file of files) {
            log.debug('... load tasks file', file);
            var mod = require(file);
            mod(self, log);
        }
    }
}

module.exports = CoTasks;
