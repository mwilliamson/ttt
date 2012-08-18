var util = require("util");
var http = require("http");
var url = require("url");
var child_process = require("child_process");
var fs = require("fs");

var mkdirp = require("mkdirp");
var async = require("async");

var sourceControl = require("./source-control");
var hubs = require("./hubs");

var hub = hubs.createHub();

// TODO: should base on actual time
//~ setInterval(function() {
    //~ hub.emit("time.minute");
//~ }, 1000);

var projects = [
    {
        name: "node-shed-compiler",
        repositories: [
            {
                uri: "git+file:///home/mick/Programming/Shed/js/compiler",
                checkout: "."
            }
        ],
        path: "/tmp/Programming/js/compiler",
        build: [
            "npm install",
            "make test"
        ]
    }
];

setUpProjects(hub, projects);

function setUpProjects(hub, projects) {
    projects.forEach(setUpProject.bind(null, hub));
}

function setUpProject(hub, project) {
    hub.on("time.minute", function() {
        async.map(project.repositories, sourceControl.fetchRepository.bind(null, project), function(err, repos) {
            if (err) {
                // TODO: do something
            } else if (repos.some(repoHasBeenUpdated)) {
                hub.emit("projects." + project.name + ".source-updated");
                console.log("projects." + project.name + ".source-updated");
            }
        });
    });
    
    var startBuildName = "projects." + project.name + ".start-build";
    
    hub.on("projects." + project.name + ".source-updated", hub.emit.bind(hub, startBuildName));
    hub.on(startBuildName, buildProject.bind(null, project));
}

function buildProject(project) {
    async.mapSeries(project.build, performBuildStep.bind(null, project), function(err, output) {
        console.log(output.join("\n\n"));
    });
}

function performBuildStep(project, command, callback) {
    child_process.exec(command, {cwd: project.path}, function(err, stdout, stderr) {
        callback(err, stdout);
    });
}

function repoHasBeenUpdated(repo) {
    return repo.updated;
}

http.createServer(function(request, response) {
    var requestUrl = url.parse(request.url, true);
    if (requestUrl.pathname === "/emit") {
        hub.emit(requestUrl.query["event-name"]);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("OK");
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.end("404 Not Found");
    }
}).listen(50000, "127.0.0.1");

// TODO: security
// allow an event namespace to be grabbed by a module
// return a secure UUID when grabbing a namespace, and
// require that UUID whenever emitting events (but not listening)

// TODO: what if the handler for an event takes longer than it should?
// e.g. what if we poll every minute, but polling takes longer than a minute?
// need some sort of queueing system (with removal of duplicates)

// TODO: wildcard events e.g. listen to all projects building
