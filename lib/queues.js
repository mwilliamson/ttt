exports.create = function() {
    var locked = false;
    // TODO: use a more efficient queue
    var waiters = [];
    
    function add(identifier, func) {
        if (!func) {
            func = identifier;
            identifier = null;
        } else if (isAlreadyWaiting(identifier)) {
            return;
        }
        if (locked) {
            waiters.push({
                identifier: identifier,
                func: func
            });
        } else {
            locked = true;
            func(unlock);
        }
    }
    
    function isAlreadyWaiting(identifier) {
        return waiters.some(function(waiter) {
            return waiter.identifier === identifier;
        });
    }
    
    function unlock() {
        if (waiters.length > 0) {
            waiters.shift().func(unlock);
        } else {
            locked = false;
        }
    }
    
    return {
        add: add
    };
};
