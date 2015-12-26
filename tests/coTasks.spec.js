'use strict';

var CoTasks = require('../index.js');
var expect = require('expect.js');
var sinon = require('sinon');

describe('co-tasks', function() {
    describe('Constructor', function() {
        it('Should be a CoTasks class', function() {
            expect(CoTasks).to.be.a('function');      
        });

        it('Should be an instance of CoTasks', function() {
            var coTasks = new CoTasks();
            expect(coTasks).to.be.a(CoTasks); 
        });
    });

    describe('defineTasks', function() {
        var taskRunner;

        beforeEach(function() {
            taskRunner = new CoTasks();
        });

        it('Should pre define task names', function() {
            taskRunner.defineTasks(['foo', 'bar']);

            expect(taskRunner.allowedTasks).to.eql(['foo', 'bar']);
            expect(taskRunner.tasks).to.eql({
                'foo': [],
                'bar': []
            });
        });

        it('Should pre define task names, including pre tasks', function() {
            taskRunner.defineTasks(['foo', 'bar'], true);

            expect(taskRunner.allowedTasks).to.eql(['pre-foo', 'foo', 'pre-bar', 'bar']);
            expect(taskRunner.tasks).to.eql({
                'pre-foo': [],
                'foo': [],
                'pre-bar': [],
                'bar': []
            });
        });

        it('Should pre define task names, including post tasks', function() {
            taskRunner.defineTasks(['foo', 'bar'], false, true);

            expect(taskRunner.allowedTasks).to.eql(['foo', 'post-foo', 'bar', 'post-bar']);
            expect(taskRunner.tasks).to.eql({
                'foo': [],
                'post-foo': [],
                'bar': [],
                'post-bar': []
            });
        });

        it('Should pre define task names, including pre and post tasks', function() {
            taskRunner.defineTasks(['foo', 'bar'], true, true);

            expect(taskRunner.allowedTasks).to.eql(['pre-foo', 'foo', 'post-foo', 'pre-bar', 'bar', 'post-bar']);
            expect(taskRunner.tasks).to.eql({
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

            expect(taskRunner.tasks).to.be.an('object');
            expect(taskRunner.tasks).to.eql({
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

            expect(taskRunner.tasks).to.be.an('object');
            expect(taskRunner.tasks).to.eql({
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
            expect(taskRunner.registerTask.bind(taskRunner)).withArgs('bar', fn).to.throwException((/not defined/));

            expect(taskRunner.tasks).to.eql({
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
            expect(promise).to.be.an(Promise);
            expect(promise.then).to.be.an('function');
            expect(promise.catch).to.be.an('function');

            promise.then(function() {
                expect(fn1.calledOnce).to.be.ok();
                expect(fn2.calledOnce).to.be.ok();
                expect(fn3.calledOnce).to.be.ok();
                expect(fn4.calledOnce).to.be.ok();


                expect(fn2.calledAfter(fn1)).to.be.ok();
                expect(fn3.calledAfter(fn2)).to.be.ok();
                expect(fn4.calledAfter(fn3)).to.be.ok();
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });
});
