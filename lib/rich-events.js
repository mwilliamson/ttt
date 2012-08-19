exports.EventEmitter = RichEventEmitter;
exports.pipe = pipe;

function RichEventEmitter() {
    this._listeners = {};
}

RichEventEmitter.prototype.on = function(eventName, listener) {
    var sections = splitEventName(eventName);
    
    var listeners = this._listeners;
    sections.forEach(function(section) {
        listeners = listeners[section] = listeners[section] || {_listeners: []};
    });
    
    listeners._listeners.push(listener);
};

RichEventEmitter.prototype.emit = function(eventName) {
    var listenerThis = {name: eventName};
    var listenerArguments = Array.prototype.slice.call(arguments, 1);
    
    this._getListeners(eventName).forEach(fireListener);
    
    function fireListener(listener) {
        listener.apply(listenerThis, listenerArguments);
    }
};

RichEventEmitter.prototype._getListeners = function(eventName) {
    return flatten([
        (this._listeners["**"] || {})._listeners || [],
        _getListeners(this._listeners, createLinkedList(splitEventName(eventName)))
    ]);
};

function reversed(array) {
    var result = array.slice(0);
    result.reverse();
    return result;
}

function createLinkedList(array, index) {
    index = index || 0;
    if (index >= array.length) {
        return null;
    } else {
        return {
            head: array[index],
            tail: createLinkedList(array, index + 1)
        };
    }
}

function _getListeners(listeners, sections) {
    if (!listeners) {
        return [];
    } else if (sections === null) {
        return listeners._listeners;
    } else {
        var section = sections.head;
        return flatten([
            _getListeners(listeners[section], sections.tail),
            _getListeners(listeners["*"], sections.tail)
        ]);
    }
    
    var roots = [listeners];
    
    sections.forEach(function(section) {
        listeners = listeners[section] || {};
    });
    return listeners._listeners;
};

function splitEventName(eventName) {
    return eventName.split(".");
}

function flatten(arrays) {
    var result = [];
    arrays.forEach(function(array) {
        (array || []).forEach(function(element) {
            result.push(element);
        });
    });
    return result;
}

function pipe(options) {
    var to = options.destination;
    var destinationPrefix = options.destinationPrefix ?
        options.destinationPrefix + "." : "";
    options.events.forEach(function(name) {
        options.source.on(name, function() {
            var destinationName = destinationPrefix + (this.name || name);
            var eventArgs = Array.prototype.slice.call(arguments, 0);
            var args = [destinationName].concat(eventArgs);
            to.emit.apply(to, args);
        });
    });
}
