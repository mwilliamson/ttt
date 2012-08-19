var child_process = require("child_process");
var events = require("events");

exports.series = function(funcs) {
    var result = new events.EventEmitter();
    var current = 0;
    
    function doNext() {
        if (current < funcs.length) {
            var process = funcs[current]();
            current += 1;
            process.stdout.on("data", function(chunk) {
                result.emit("stdout", chunk);
            });
            process.stderr.on("data", function(chunk) {
                result.emit("stderr", chunk);
            });
            process.on("exit", function(code) {
                if (code === 0) {
                    doNext();
                } else {
                    result.emit("exit", code);
                }
            });
        } else {
            result.emit("exit", 0);
        }
    }
    doNext();
    return result;
};
