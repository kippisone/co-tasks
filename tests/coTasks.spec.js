var coTask = require('../index.js');

describe('co-tasks', function() {
    'use strict';
    
    describe('Constructor', function() {
        it('Should be a CoTask class', function() {
            expect(coTask).to.be.a('function');            
        });
    });
});