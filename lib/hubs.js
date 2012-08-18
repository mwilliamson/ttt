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
    var listenerThis = {name: eventName};
    var listenerArguments = Array.prototype.slice.call(arguments, 1);
    
    this._getListeners("**").forEach(fireListener);
    this._getListeners(eventName).forEach(fireListener);
    
    function fireListener(listener) {
        listener.apply(listenerThis, listenerArguments);
    }
};

RichEventEmitter.prototype._getListeners = function(eventName) {
    return this._listeners[eventName] = this._listeners[eventName] || [];
};
