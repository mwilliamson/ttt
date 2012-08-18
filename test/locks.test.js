var locks = require("../lib/locks");

exports.functionIsCalledImmediatelyIfLockIsAvailable = function(test) {
    var lock = locks.createLock();
    var add = lock.wrap(function(first, second, callback) {
        callback(first + second);
    });
    
    add(1, 2, function(result) {
        test.equal(result, 3);
        test.done();
    });
};

exports.functionsMustWaitForLock = function(test) {
    var lock = locks.createLock();
    
    var first = createManualFunction();
    var second = createManualFunction();
    var third = createManualFunction();
    
    var wrappedFirst = lock.wrap(first);
    var wrappedSecond = lock.wrap(second);
    var wrappedThird = lock.wrap(third);
    
    // first acquires lock
    wrappedFirst(1, 2, first.done);
    test.equal(first.started, true);
    test.deepEqual([1, 2], first.args);
    
    // second queues for lock
    wrappedSecond(3, 4, second.done);
    test.equal(second.started, false);
    
    // third queues for lock
    wrappedThird(5, 6, third.done);
    test.equal(third.started, false);
    
    // first releases lock, second acquires
    first.callback(10, 20);
    test.deepEqual([10, 20], first.callbackArgs);
    test.equal(second.started, true);
    test.deepEqual([3, 4], second.args);
    test.equal(third.started, false);
    
    // second releases lock, third acquires
    second.callback(30, 40);
    test.deepEqual([30, 40], second.callbackArgs);
    test.equal(third.started, true);
    test.deepEqual([5, 6], third.args);
    
    // third releases
    third.callback(50, 60);
    test.deepEqual([50, 60], third.callbackArgs);
    
    test.done();
};

function createManualFunction() {
    var func = function() {
        if (func.started) {
            throw new Error("Function has already been called");
        }
        func.started = true;
        func.args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        func.callback = arguments[arguments.length - 1];
    };
    func.started = false;
    func.args = null;
    
    func.callbackArgs = null;
    
    func.done = function() {
        func.callbackArgs = Array.prototype.slice.call(arguments, 0);
    };
    
    return func;
}
