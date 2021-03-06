var util = require("util");
var http = require("http");
var url = require("url");
var child_process = require("child_process");
var processes = require("./processes");
var fs = require("fs");
var path = require("path");

var mkdirp = require("mkdirp");
var async = require("async");

var projectsModule = require("./projects");
var sourceControl = require("./source-control");
var hubs = require("./hubs");
var queues = require("./queues");
var events = require("./rich-events");

var hub = hubs.createHub();

var debug = true;

if (debug) {
    hub.on("**", function() {
        console.log("DEBUG: " + this.name);
    });
}

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
    project.workspace = project.workspace || path.join(project.path, "workspace");
    
    var queue = queues.create();
    
    hub.on("time.minute", function() {
        queue.add("updateSources", updateSources);
    });
    
    var startBuildName = "projects." + project.name + ".start-build";
    
    hub.on("projects." + project.name + ".source.updated", hub.emit.bind(hub, startBuildName));
    hub.on("projects." + project.name + ".force-build", function() {
        queue.add("updateSources", updateSources);
        queueBuild();
    });
    
    hub.on(startBuildName, queueBuild);
    
    function queueBuild() {
        queue.add(startBuildName, function(callback) {
            var buildPrefix = buildProject(hub, project, callback);
            
        });
    }
    
    function updateSources(callback) {
        // TODO: FIX: map will return before actually finishing all computation
        // if on of the mapped elements errors
        async.map(project.repositories, updateSource, function(err, repos) {
            if (err) {
            } else if (repos.some(repoHasBeenUpdated)) {
                hub.emit("projects." + project.name + ".source.updated");
            } else {
                hub.emit("projects." + project.name + ".source.unchanged");
            }
            callback(err);
        });
    }
    
    function updateSource(repository, callback) {
        var checkoutPath = path.join(project.workspace, repository.checkout);
        return sourceControl.fetchRepository(repository.uri, checkoutPath, callback);
    }
}

function buildProject(hub, project, callback) {
    var build = projectsModule.build(project);
    var buildNumber = build.buildNumber;
    var eventPrefix = "projects." + project.name + ".builds." + buildNumber;
    hub.emit(eventPrefix + ".started");
    
    events.pipe({
        source: build,
        destination: hub,
        destinationPrefix: eventPrefix,
        events: ["**"]
    });
    build.on("finished", function(code) {
        callback();
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
