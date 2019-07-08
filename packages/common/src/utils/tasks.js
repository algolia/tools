export function TasksGroup(name) {
    this.tasks = [];
    this.tasksIds = [];
    this.name = name;

    this.addTask = function (task) {
        this.tasks.push(task);
    };

    this.addAlgoliaTaskId = function (taskId) {
        this.tasksIds.push(taskId);
    };

    this.run = async function () {
        let i;
        for (i = 0; i < this.tasks.length; i++) {
            await this.tasks[i].run();
        }
    }
}

export function Task(name, callback) {
    this.name = name;
    if (callback) this.callback = callback;
    this.outOf = null;
    this.nth = null;
    this.running = false;
    this.done = false;

    this.setCallback = function (callback) {
        this.callback = callback;
    };

    this.setNth = function (nth) {
        this.nth = nth;
    };

    this.setOutOf = function (outOf) {
        this.outOf = outOf;
    };

    this.run = async function () {
        this.running = true;
        await this.callback();
        this.running = false;
        this.done = true;
    };
}