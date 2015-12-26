co-tasks
========

Task or hook runner using co. Runs an array of tasks in series.

```js

var TaskRunner = require('co-tasks');
var taskRunner = new TaskRunner();

// Add tasks
taskRunner.registerTask('foo', function(done) {
    console.log('Foo one');
    done();
});

taskRunner.registerTask('foo', function(done) {
    console.log('Foo two');
    done();
});

taskRunner.registerTask('pre-foo', function(done) {
    console.log('Start');
    done();
});

taskRunner.registerTask('post-foo', function(done) {
    console.log('After foo');
    done();
});

taskRunner.registerTask('finish', function(done) {
    console.log('Finish');
    done();
});

// Call tasks

taskRunner.run(['foo', 'finish']);

// You'll see, pre-* and post-* tasks will be calling as well
// Output

Start
Foo one
Foo two
After foo
Finish

```
