var events = require("events");

exports.createHub = createHub;

function createHub() {
    return new events.EventEmitter();
}
