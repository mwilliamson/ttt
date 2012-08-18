var queues = require("../lib/queues");

exports.functionIsCalledImmediatelyIfQueueIsEmpty = function(test) {
    var queue = queues.create();
    queue.add(function() {
        test.done();
    });
};

exports.functionIsCalledImmediatelyIfPreviousFunctionHasFinished = function(test) {
    var queue = queues.create();
    queue.add(function(callback) {
        callback();
    });
    queue.add(function(callback) {
        test.done();
    });
};

exports.functionWaitsForPreviousFunctionsToFinish = function(test) {
    var queue = queues.create();
    
    var first = createManualFunction();
    var second = createManualFunction();
    var third = createManualFunction();
    
    // first starts
    queue.add(first);
    test.equal(first.started, true);
    
    // second queues
    queue.add(second);
    test.equal(second.started, false);
    
    // third queues
    queue.add(third);
    test.equal(third.started, false);
    
    // first finished, second starts
    first.callback();
    test.equal(second.started, true);
    test.equal(third.started, false);
    
    // second finishes, third starts
    second.callback();
    test.equal(third.started, true);
    
    test.done();
};

exports.functionsCanBeAddedWithIdentifier = function(test) {
    var queue = queues.create();
    queue.add("start", function() {
        test.done();
    });
};

exports.addingAdditionalFunctionsWithSameIdentifierDoesNothing = function(test) {
    var queue = queues.create();
    
    var first = createManualFunction();
    var second = createManualFunction();
    var third = createManualFunction();
    
    // first starts
    queue.add("start", first);
    test.equal(first.started, true);
    
    // second queues despite having same name since first is not queued
    queue.add("start", second);
    test.equal(second.started, false);
    
    // third is discarded since second is queued with the same name
    queue.add("start", third);
    test.equal(third.started, false);
    
    first.callback();
    test.equal(second.started, true);
    test.equal(third.started, false);
    
    second.callback();
    test.equal(third.started, false);
    
    test.done();
};

function createManualFunction() {
    var func = function(callback) {
        if (func.started) {
            throw new Error("Function has already been called");
        }
        func.started = true;
        func.callback = callback;
    };
    func.started = false;
    
    return func;
}
