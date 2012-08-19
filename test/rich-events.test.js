var richEvents = require("../lib/rich-events");

exports.canEmitAndHandleEvent = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    emitter.on("name", function() {
        test.done();
    });
    
    emitter.emit("name");
};

exports.canEmitAndHandleEventWithDataOnHub = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    emitter.on("name", function(firstName, lastName) {
        test.equal(firstName, "Bob");
        test.equal(lastName, "Bobertson");
        test.done();
    });
    
    emitter.emit("name", "Bob", "Bobertson");
};

exports.canUseDoubleStarToListenToAllEvents = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    var doubleStarFired = false;
    
    emitter.on("projects.compiler.finished", function(firstName, lastName) {
        test.equal(doubleStarFired, true);
        test.done();
    });
    
    emitter.on("**", function() {
        doubleStarFired = true
    });
    
    emitter.emit("projects.compiler.finished");
};

exports.doubleStarListenerFiresBeforeSpecificListeners = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    emitter.on("**", function() {
        test.done();
    });
    
    emitter.emit("projects.compiler.finished");
};

exports.thisIsBoundToEventWithNameInListener = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    emitter.on("**", function() {
        test.equal(this.name, "projects.compiler.finished");
        test.done();
    });
    
    emitter.emit("projects.compiler.finished");
};

exports.singleStarIsWildcardForEventNameSection = function(test) {
    var emitter = new richEvents.EventEmitter();
    
    emitter.on("projects.*.finished", function() {
        test.equal(this.name, "projects.compiler.finished");
        test.done();
    });
    
    emitter.emit("projects.compiler.finished");
};

exports.pipingEventsEmitsTheSameEventsOnTargetAsOnSource = function(test) {
    var source = new richEvents.EventEmitter();
    var destination = new richEvents.EventEmitter();
    
    richEvents.pipe({
        source: source,
        destination: destination,
        events: ["start", "finish"]
    });
    
    destination.on("finish", function(arg) {
        test.equal(this.name, "finish");
        test.equal(arg, 42);
        test.done();
    });
    
    source.emit("finish", 42);
};

exports.canPrependPrefixToEventNamesWhenPipingEvents = function(test) {
    var source = new richEvents.EventEmitter();
    var destination = new richEvents.EventEmitter();
    
    richEvents.pipe({
        source: source,
        destination: destination,
        destinationPrefix: "build.4",
        events: ["start", "finish"]
    });
    
    destination.on("build.4.finish", function(arg) {
        test.equal(this.name, "build.4.finish");
        test.equal(arg, 42);
        test.done();
    });
    
    source.emit("finish", 42);
};
