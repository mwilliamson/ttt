var hubs = require("../lib/hubs");

exports.canEmitAndHandleEventOnHub = function(test) {
    var hub = hubs.createHub();
    
    hub.on("name", function() {
        test.done();
    });
    
    hub.emit("name");
};

exports.canEmitAndHandleEventWithDataOnHub = function(test) {
    var hub = hubs.createHub();
    
    hub.on("name", function(firstName, lastName) {
        test.equal(firstName, "Bob");
        test.equal(lastName, "Bobertson");
        test.done();
    });
    
    hub.emit("name", "Bob", "Bobertson");
};

exports.canUseDoubleStarToListenToAllEvents = function(test) {
    var hub = hubs.createHub();
    
    var doubleStarFired = false;
    
    hub.on("projects.compiler.finished", function(firstName, lastName) {
        test.equal(doubleStarFired, true);
        test.done();
    });
    
    hub.on("**", function() {
        doubleStarFired = true
    });
    
    hub.emit("projects.compiler.finished");
};

exports.doubleStarListenerFiresBeforeSpecificListeners = function(test) {
    var hub = hubs.createHub();
    
    hub.on("**", function() {
        test.done();
    });
    
    hub.emit("projects.compiler.finished");
};

exports.thisIsBoundToEventWithNameInListener = function(test) {
    var hub = hubs.createHub();
    
    hub.on("**", function() {
        test.equal(this.name, "projects.compiler.finished");
        test.done();
    });
    
    hub.emit("projects.compiler.finished");
};
