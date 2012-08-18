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
    
    hub.on("**", function() {
        test.done();
    });
    
    hub.emit("projects.compiler.finished");
    
};
