co-tasks
========

Task or hook runner using co. Runs an array of tasks in series.

## .run([tasks], [ctx], [args], [timeout])

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

## .pipe([tasks], [ctx], pipeObj, [timeout])

Runns tasks in series, pipes `pipeObj` through all tasks in series  

`tasks` Task names, this can be optional if allowedTasks option is set.  
`ctx` This context  
`pipeObj` Pipe through object  
`timeout` Timpout in milliseconds. Defaults to `30000`  

### yieldables

We call yieldable a function,  a generator or a promise, supported by co-task.

#### Promises

```js
taskRunner.registerTask('foo', new Promise(function(resolve, reject) {
    resolve('apple');
});
```

#### Generators

```js
taskRunner.registerTask('foo', function *() {
    return 'banana';
}
```

#### Callback functions

```js
taskRunner.registerTask('foo', function(done) {
    done(null, 'coconut');
}
```

#### Callbacks with promises

```js
taskRunner.registerTask('foo', function(promise) {
    promise.resolve('date');
}
```

#### Promise returning functions

```js
taskRunner.registerTask('foo', function(promise) {
    return Promise.resolve('elderberry');
}
```


Call it all together

```js
taskRunner.run(['foo']).then(function(result) {
    console.log(result);

    // result === [
    //     {
    //         task: 'foo',
    //         results: ['apple', 'banana', 'coconut', 'date', 'elderberry']
    //     }
    // ]
}).catch(function(err) {
    // Error handling
});
```

### Arguments and this context

Passing arguments or a this context to yieldable is very easy.
co-tasks accepts a this context as second parameter and an arguments array as third parameter.
Both of them are optional.

```js
let ctx = {
    prefix: '#'
};

let args = ['apple', 'banana'];

taskRunner.registerTask('foo', function *(arg1, arg2) {
    return this.prefix + arg1;
});

taskRunner.registerTask('foo', function *(arg1, arg2) {
    return this.prefix + arg2;
});

taskRunner(['foo'], ctx, args).then(function(result) {
    //result contains
    [{
        task: 'foo',
        results: ['#apple', '#banana']
    }]
}).catch(function(err) {
    // Error handling
});
```

### Timeout

co-tasks timeouts after 30 seconds by default.
The timeout can be changed by passing a number of milliseconds as fourth or last parameter

```js
var promise = taskRunner(['foo'], ctx, args, 500);

```
