var events = require("./rich-events");
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
    events.pipe(process, result, ["stdout", "stderr"]);
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

function recordBuildOutput(project, buildNumber, process) {
    var outputFile = path.join(project.path, "builds", buildNumber.toString(), "output");
    mkdirp(path.dirname(outputFile));
    process.on("stdout", function(chunk) {
        fs.appendFile(outputFile, chunk, function(){});
    });
    process.on("stderr", function(chunk) {
        fs.appendFile(outputFile, chunk, function(){});
    });
    process.on("exec", function(command) {
        fs.appendFile(outputFile, "$ " + command + "\n", function(){});
    });
}
