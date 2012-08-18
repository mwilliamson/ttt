exports.createLock = createLock;

function createLock() {
    var locked = false;
    // TODO: use a more efficient queue
    var waiters = [];
    
    function wrap(func) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            var originalCallback = arguments[arguments.length - 1];
            var callback = function() {
                originalCallback.apply(this, arguments);
                unlock();
            };
            args.push(callback);
            if (locked) {
                var bindArgs = [this].concat(args);
                waiters.push(func.bind.apply(func, bindArgs));
            } else {
                locked = true;
                func.apply(this, args);
            }
        };
    }
    
    function unlock() {
        if (waiters.length > 0) {
            waiters.shift()();
        }
    }
    
    return {
        wrap: wrap
    }
}
