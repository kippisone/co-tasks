'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let Queue = require('../libs/queue');

describe('Queue', function() {
  describe('Instance', function() {
    it('Creates a queue instance', function() {
      let queue = new Queue();
      inspect(queue).isObject();
      inspect(queue.items).isArray();
    });
  });

  describe('len', function() {
    it('returns queue length', function() {
      let queue = new Queue();
      inspect(queue.len).isFunction();
      inspect(queue.len()).isNumber();
      inspect(queue.len()).isEql(0);
      queue.items = ['foo', 'bar'];
      inspect(queue.len()).isEql(2);
    });
  });

  describe('push', function() {
    it('adds an item on the end of a queue', function() {
      let queue = new Queue();
      queue.push('foo');
      queue.push('bar');

      inspect(queue.items).isEql(['foo', 'bar']);
    });
  });

  describe('unshift', function() {
    it('adds an item on the end of a queue', function() {
      let queue = new Queue();
      queue.unshift('foo');
      queue.unshift('bar');

      inspect(queue.items).isEql(['bar', 'foo']);
    });
  });

  describe('shift', function() {
    it('removes an item on the begin of a queue', function() {
      let queue = new Queue();
      queue.items = ['foo', 'bar'];
      let item = queue.shift();

      inspect(queue.items).hasLength(1);
      inspect(item).isEql('foo');
    });

    it('returns null if queue is empty', function() {
      let queue = new Queue();
      queue.items = ['foo', 'bar'];
      let item1 = queue.shift();
      let item2 = queue.shift();
      let item3 = queue.shift();

      inspect(item1).isEql('foo');
      inspect(item2).isEql('bar');
      inspect(item3).isNull();
    });
  });

  describe('pop', function() {
    it('removes an item on the end of a queue', function() {
      let queue = new Queue();
      queue.items = ['foo', 'bar'];
      let item = queue.pop();

      inspect(queue.items).hasLength(1);
      inspect(item).isEql('bar');
    });

    it('returns null if queue is empty', function() {
      let queue = new Queue();
      queue.items = ['foo', 'bar'];
      let item1 = queue.pop();
      let item2 = queue.pop();
      let item3 = queue.pop();

      inspect(item1).isEql('bar');
      inspect(item2).isEql('foo');
      inspect(item3).isNull();
    });
  });

});
