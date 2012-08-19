var richEvents = require("./rich-events");

exports.createHub = createHub;

function createHub() {
    return new richEvents.EventEmitter();
}
