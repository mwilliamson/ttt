var events = require("events");
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

var mkdirp = require("mkdirp");

var processes = require("./processes");

exports.build = build;

function build(project) {
    var result = new events.EventEmitter();
    
    project.lastBuildNumber = project.lastBuildNumber || 0;
    var buildNumber = project.lastBuildNumber += 1;
    result.buildNumber = buildNumber;
    
    var buildSteps = createBuildSteps(project, result);
    
    var process = processes.series(buildSteps);
    pipeEvents(process, result, ["stdout", "stderr"]);
    process.on("exit", function(code) {
        if (code === 0) {
            result.emit("success");
        } else {
            result.emit("failure");
        }
        result.emit("finished");
    });
    recordBuildOutput(project, buildNumber, result);
    return result;
}

function createBuildSteps(project, result) {
    return project.build.map(function(command) {
        return function() {
            result.emit("exec", command);
            return child_process.exec(command, {cwd: project.workspace});
        };
    });
};

// TODO: use rich event emitter to simplify this
function pipeEvents(from, to, names) {
    names.forEach(function(name) {
        from.on(name, function() {
            var args = [name].concat(Array.prototype.slice.call(arguments, 0));
            to.emit.apply(to, args);
        });
    });
}

function recordBuildOutput(project, buildNumber, process) {
    var outputFile = path.join(project.path, "builds", buildNumber.toString(), "output");
    mkdirp(path.dirname(outputFile));
    process.on("stdout", function(chunk) {
        fs.appendFile(outputFile, chunk);
    });
    process.on("stderr", function(chunk) {
        fs.appendFile(outputFile, chunk);
    });
    process.on("exec", function(command) {
        fs.appendFile(outputFile, "$ " + command + "\n");
    });
}
