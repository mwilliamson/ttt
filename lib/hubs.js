var events = require("events");

exports.createHub = createHub;

function createHub() {
    return new RichEventEmitter();
}

function RichEventEmitter() {
    this._listeners = {};
}

RichEventEmitter.prototype.on = function(eventName, listener) {
    this._getListeners(eventName).push(listener);
};

RichEventEmitter.prototype.emit = function(eventName) {
    var eventData = Array.prototype.slice.call(arguments, 1);
    
    this._getListeners(eventName).forEach(fireListener);
    this._getListeners("**").forEach(fireListener);
    
    function fireListener(listener) {
        listener.apply(null, eventData);
    }
};

RichEventEmitter.prototype._getListeners = function(eventName) {
    return this._listeners[eventName] = this._listeners[eventName] || [];
};
