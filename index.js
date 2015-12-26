class CoTasks {
    constructor() {
        this.tasks = {};
    }

    /**
     * Runs tasks in series.
     * @method run
     *
     * @param {String|Array} [tasks] Task name to be run. If this is not set, all tasks will be run
     * @return {Object} Returns a promise
     */
    run() {

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
            if (this.checkTaskNames) {
                throw new Error('Task name ' + name + ' not defined!\nAllowed tasks are: ' + Object.keys(this.tasks).join(', '));
            }

            this.tasks.name = [];
        }
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
        this.checkTaskNames = true;
        for (let task of tasks) {
            if (regPreTasks) {
                this.tasks['pre-' . task] = [];
            }

            this.tasks[task] = [];

            if (regPostTasks) {
                this.tasks['post-' . task] = [];
            }
        }
    }
}

module.exports = CoTasks;