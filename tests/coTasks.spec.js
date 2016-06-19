'use strict';

var path = require('path');
var CoTasks = require('../index.js');
var inspect = require('inspect.js');
var sinon = require('sinon');

describe('co-tasks', function() {
  describe('Constructor', function() {
    it('Should be a CoTasks class', function() {
            inspect(CoTasks).isClass();
    });

    it('Should be an instance of CoTasks', function() {
      var coTasks = new CoTasks();
            inspect(coTasks).isInstanceOf(CoTasks);
    });
  });

  describe('defineTasks', function() {
    var taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should pre define task names', function() {
      taskRunner.defineTasks(['foo', 'bar']);

            inspect(taskRunner.allowedTasks).isEql(['foo', 'bar']);
            inspect(taskRunner.tasks).isEql({
        'foo': [],
        'bar': []
      });
    });

    it('Should pre define task names, including pre tasks', function() {
      taskRunner.defineTasks(['foo', 'bar'], true);

            inspect(taskRunner.allowedTasks).isEql(['foo', 'bar']);
            inspect(taskRunner.tasks).isEql({
        'pre-foo': [],
        'foo': [],
        'pre-bar': [],
        'bar': []
      });
    });

    it('Should pre define task names, including post tasks', function() {
      taskRunner.defineTasks(['foo', 'bar'], false, true);

            inspect(taskRunner.allowedTasks).isEql(['foo', 'bar']);
            inspect(taskRunner.tasks).isEql({
        'foo': [],
        'post-foo': [],
        'bar': [],
        'post-bar': []
      });
    });

    it('Should pre define task names, including pre and post tasks', function() {
      taskRunner.defineTasks(['foo', 'bar'], true, true);

            inspect(taskRunner.allowedTasks).isEql(['foo', 'bar']);
            inspect(taskRunner.tasks).isEql({
        'pre-foo': [],
        'foo': [],
        'post-foo': [],
        'pre-bar': [],
        'bar': [],
        'post-bar': []
      });
    });
  });

  describe('registerTask', function() {
    var taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should register new tasks', function() {
      var fn = function() {

      };

      taskRunner.registerTask('foo', fn);
      taskRunner.registerTask('foo', fn);
      taskRunner.registerTask('pre-foo', fn);
      taskRunner.registerTask('post-foo', fn);

            inspect(taskRunner.tasks).isObject();
            inspect(taskRunner.tasks).isEql({
        'foo': [fn, fn],
        'pre-foo': [fn],
        'post-foo': [fn]
      });
    });

    it('Should register predefined tasks', function() {
      var fn = function() {

      };

      taskRunner.defineTasks(['foo'], true, true);

      taskRunner.registerTask('foo', fn);
      taskRunner.registerTask('foo', fn);
      taskRunner.registerTask('pre-foo', fn);
      taskRunner.registerTask('post-foo', fn);

            inspect(taskRunner.tasks).isObject();
            inspect(taskRunner.tasks).isEql({
        'foo': [fn, fn],
        'pre-foo': [fn],
        'post-foo': [fn]
      });
    });

    it('Should fail by registering an unallowed task', function() {
      var fn = function() {

      };

      taskRunner.defineTasks(['foo'], true, true);

      taskRunner.registerTask('foo', fn);
            inspect(taskRunner.registerTask.bind(taskRunner)).withArgs('bar', fn).doesThrow((/not defined/));

            inspect(taskRunner.tasks).isEql({
        'pre-foo': [],
        'foo': [fn],
        'post-foo': []
      });
    });
  });

  describe('run', function() {
    var taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should run tasks', function(done) {
      var fn1 = sinon.stub();
      var fn2 = sinon.stub();
      var fn3 = sinon.stub();
      var fn4 = sinon.stub();

      fn1.yields(null);
      fn2.yields(null);
      fn3.yields(null);
      fn4.yields(null);

      taskRunner.registerTask('foo', fn2);
      taskRunner.registerTask('foo', fn3);
      taskRunner.registerTask('pre-foo', fn1);
      taskRunner.registerTask('post-foo', fn4);

      var promise = taskRunner.run('foo');
            inspect(promise).isPromise()
            inspect(promise.then).isFunction();
            inspect(promise.catch).isFunction();

      promise.then(function() {
                inspect(fn1.calledOnce).isTruthy();
                inspect(fn2.calledOnce).isTruthy();
                inspect(fn3.calledOnce).isTruthy();
                inspect(fn4.calledOnce).isTruthy();


                inspect(fn2.calledAfter(fn1)).isTruthy();
                inspect(fn3.calledAfter(fn2)).isTruthy();
                inspect(fn4.calledAfter(fn3)).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should run predefined tasks', function(done) {
      var fn1 = sinon.stub();
      var fn2 = sinon.stub();
      var fn3 = sinon.stub();
      var fn4 = sinon.stub();

      fn1.yields(null);
      fn2.yields(null);
      fn3.yields(null);
      fn4.yields(null);

      taskRunner.defineTasks(['foo'], true, true);

      taskRunner.registerTask('foo', fn2);
      taskRunner.registerTask('foo', fn3);
      taskRunner.registerTask('pre-foo', fn1);
      taskRunner.registerTask('post-foo', fn4);


      var promise = taskRunner.run();

            inspect(promise).isPromise()
            inspect(promise.then).isFunction();
            inspect(promise.catch).isFunction();

      promise.then(function() {
                inspect(fn1.calledOnce).isTruthy();
                inspect(fn2.calledOnce).isTruthy();
                inspect(fn3.calledOnce).isTruthy();
                inspect(fn4.calledOnce).isTruthy();


                inspect(fn2.calledAfter(fn1)).isTruthy();
                inspect(fn3.calledAfter(fn2)).isTruthy();
                inspect(fn4.calledAfter(fn3)).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run function tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(next) {
        stub();
        next();
      });

      var promise = taskRunner.run();
      promise.then(function() {
                inspect(stub.calledOnce).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(promise) {
        stub();
        promise.resolve();
      });

      var promise = taskRunner.run();
      promise.then(function() {
                inspect(stub.calledOnce).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise returning function tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function() {
        stub();
        return Promise.resolve();
      });

      var promise = taskRunner.run();
      promise.then(function() {
                inspect(stub.calledOnce).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run generator tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function *() {
        yield Promise.resolve();
        stub();
        return;
      });

      var promise = taskRunner.run();
      promise.then(function() {
                inspect(stub.calledOnce).isTruthy();
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run function tasks with args', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(arg1, next) {
        stub();
        next(null, arg1);
      });

      var promise = taskRunner.run(null, ['test']);
      promise.then(function(result) {
        inspect(stub.calledOnce).isTrue();
        inspect(result)
          .isArray()
          .isEql([{
            task: 'foo',
            results: ['test']
          }]);

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise tasks with args', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(arg1, promise) {
        stub();
        promise.resolve(arg1);
      });

      var promise = taskRunner.run(null, ['test']);
      promise.then(function(result) {
        inspect(stub.calledOnce).isTrue();
        inspect(result)
          .isArray()
          .isEql([{
            task: 'foo',
            results: ['test']
          }]);

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise returning function tasks with args', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(arg1) {
        stub();
        return Promise.resolve(arg1);
      });

      var promise = taskRunner.run(null, ['test']);
      promise.then(function(result) {
        inspect(stub.calledOnce).isTrue();
        inspect(result)
          .isArray()
          .isEql([{
            task: 'foo',
            results: ['test']
          }]);

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run generator tasks with args', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function *(arg1) {
        yield Promise.resolve();
        stub();
        return arg1;
      });

      var promise = taskRunner.run(null, ['test']);
      promise.then(function(result) {
        inspect(stub.calledOnce).isTrue();
        inspect(result)
          .isArray()
          .isEql([{
            task: 'foo',
            results: ['test']
          }]);

        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('pipe', function() {
    var taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should pipe tasks in series', function(done) {
      var fn1 = sinon.spy(function(obj, callback) {
       obj.fn1 = true;
       callback(null, obj);
      });

      var fn2 = sinon.spy(function(obj, callback) {
       obj.fn2 = true;
       callback(null, obj);
      });

      var fn3 = sinon.spy(function(obj, callback) {
       obj.fn3 = true;
       callback(null, obj);
      });

      var fn4 = sinon.spy(function(obj, callback) {
       obj.fn4 = true;
       callback(null, obj);
      });

      taskRunner.registerTask('foo', fn2);
      taskRunner.registerTask('foo', fn3);
      taskRunner.registerTask('pre-foo', fn1);
      taskRunner.registerTask('post-foo', fn4);

      var promise = taskRunner.pipe(['foo'], {});
            inspect(promise).isPromise()
            inspect(promise.then).isFunction();
            inspect(promise.catch).isFunction();

      promise.then(function(res) {
                inspect(fn1.calledOnce).isTruthy();
                inspect(fn2.calledOnce).isTruthy();
                inspect(fn3.calledOnce).isTruthy();
                inspect(fn4.calledOnce).isTruthy();

                inspect(fn2.calledAfter(fn1)).isTruthy();
                inspect(fn3.calledAfter(fn2)).isTruthy();
                inspect(fn4.calledAfter(fn3)).isTruthy();

                inspect(res).isEql({
         fn1: true,
         fn2: true,
         fn3: true,
         fn4: true
        });

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should pipe predefined tasks', function(done) {
      var fn1 = sinon.spy(function(obj, callback) {
       obj.fn1 = true;
       callback(null, obj);
      });

      var fn2 = sinon.spy(function(obj, callback) {
       obj.fn2 = true;
       callback(null, obj);
      });

      var fn3 = sinon.spy(function(obj, callback) {
       obj.fn3 = true;
       callback(null, obj);
      });

      var fn4 = sinon.spy(function(obj, callback) {
       obj.fn4 = true;
       callback(null, obj);
      });

      taskRunner.defineTasks(['foo'], true, true);

      taskRunner.registerTask('foo', fn2);
      taskRunner.registerTask('foo', fn3);
      taskRunner.registerTask('pre-foo', fn1);
      taskRunner.registerTask('post-foo', fn4);


      var promise = taskRunner.pipe({});

            inspect(promise).isPromise()
            inspect(promise.then).isFunction();
            inspect(promise.catch).isFunction();

      promise.then(function(res) {
                inspect(fn1.calledOnce).isTruthy();
                inspect(fn2.calledOnce).isTruthy();
                inspect(fn3.calledOnce).isTruthy();
                inspect(fn4.calledOnce).isTruthy();


                inspect(fn2.calledAfter(fn1)).isTruthy();
                inspect(fn3.calledAfter(fn2)).isTruthy();
                inspect(fn4.calledAfter(fn3)).isTruthy();

                inspect(res).isEql({
         fn1: true,
         fn2: true,
         fn3: true,
         fn4: true
        });

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should pipe function tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(obj, next) {
        stub();
        obj.a = true;
        next();
      });

      taskRunner.registerTask('foo', function(obj, next) {
        obj.b = true;
        next();
      });

      var promise = taskRunner.pipe({});
      promise.then(function(res) {
                inspect(stub.calledOnce).isTruthy();
                inspect(res).isEql({
         a: true,
         b: true
        });

        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(obj, promise) {
        stub();
        obj.a = true;
        promise.resolve(obj);
      });

      taskRunner.registerTask('foo', function(obj, promise) {
        obj.b = true;
        promise.resolve(obj);
      });

      var promise = taskRunner.pipe();
      promise.then(function(res) {
                inspect(stub.calledOnce).isTruthy();
                inspect(res).isEql({
         a: true,
         b: true
        });
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should should run promise returning function tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function(obj) {
        stub();
        obj.a = true;
        return Promise.resolve();
      });

      taskRunner.registerTask('foo', function(obj) {
        obj.b = true;
        return Promise.resolve();
      });

      var promise = taskRunner.pipe();
      promise.then(function(res) {
                inspect(stub.calledOnce).isTruthy();
                inspect(res).isEql({
         a: true,
         b: true
        });
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Should pipe generator tasks', function(done) {
      var stub = sinon.stub();
      taskRunner.defineTasks(['foo'], true, true);
      taskRunner.registerTask('foo', function *(obj) {
        yield Promise.resolve();
        stub();
        obj.a = true;
        return obj;
      });

      taskRunner.registerTask('foo', function *(obj) {
        yield Promise.resolve();
        obj.b = true;
        return obj;
      });

      var promise = taskRunner.pipe();
      promise.then(function(res) {
                inspect(stub.calledOnce).isTruthy();
                inspect(res).isEql({
         a: true,
         b: true
        });
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('queued', function() {
    let taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should have a queued() method', function() {
      inspect(taskRunner.queued).isFunction();
    });

    it('Should register call queued tasks', function() {
      taskRunner.registerTask('prepare', function * (inQ, outQ) {
        inspect.print(inQ);
        let item = inQ.shift();
        item += '-prepare';
        outQ.push(item);
        inspect.print(outQ);
      });

      taskRunner.registerTask('parse', function * (inQ, outQ) {
        inspect.print(inQ);
        let item = inQ.shift();
        item += '-parse';
        outQ.push(item);
        inspect.print(outQ);
      });

      taskRunner.registerTask('clean', function * (inQ, outQ) {
        inspect.print(inQ);
        let item = inQ.shift();
        item += '-clean';
        outQ.push(item);
        inspect.print(outQ);
      });

      return taskRunner.queued(['prepare', 'parse', 'clean'], null, ['1', '2', '3']).then(data => {
        inspect.print(data);
        inspect(data).isArray();
        inspect(data).hasLength(3);
        inspect(data).isEql([
          '1-prepare-parse-clean',
          '2-prepare-parse-clean',
          '3-prepare-parse-clean'
        ]);
      });
    });


  });

  describe('registerTasksDir', function() {
    var taskRunner;

    beforeEach(function() {
      taskRunner = new CoTasks();
    });

    it('Should be a method', function() {
            inspect(taskRunner.registerTasksDir).isFunction();
    });

    it('Should register a task dir', function() {
      taskRunner.registerTasksDir(path.join(__dirname, 'tasks/'));
            inspect(taskRunner.tasks).isObject();
            inspect(taskRunner.tasks.foo).isArray();
            inspect(taskRunner.tasks.foo).hasLength(1);
            inspect(taskRunner.tasks.bar).isArray();
            inspect(taskRunner.tasks.bar).hasLength(1);
    });

    it('Should register a task dir', function() {
      taskRunner = new CoTasks({
        tasksDir: path.join(__dirname, 'tasks/')
      });

            inspect(taskRunner.tasks).isObject();
            inspect(taskRunner.tasks.foo).isArray();
            inspect(taskRunner.tasks.foo).hasLength(1);
            inspect(taskRunner.tasks.bar).isArray();
            inspect(taskRunner.tasks.bar).hasLength(1);
    });
  });
});
