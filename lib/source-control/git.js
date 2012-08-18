var path = require("path");
var fs = require("fs");
var child_process = require("child_process");
var util = require("util");

var mkdirp = require("mkdirp");

var gitUriPrefix = "git+";

exports.handlesUri = function(uri) {
    return uri.indexOf(gitUriPrefix) === 0;
};

exports.fetchRepository = fetchRepository;

function fetchRepository(uri, checkoutPath, callback) {
    uri = uri.substring(gitUriPrefix.length);
    fs.exists(checkoutPath, function(exists) {
        if (exists) {
            updateExistingClone(checkoutPath, callback);
        } else {
            clone(uri, checkoutPath, callback);
        }
    });
}

function updateExistingClone(checkoutPath, callback) {
    // TODO: should check it's a git repo (and the right git repo at that)
    gitRevision(checkoutPath, function(err, originalRevision) {
        child_process.exec("git pull", {cwd: checkoutPath}, function(err) {
            gitRevision(checkoutPath, function(err, currentRevision) {
                callback(err, {updated: originalRevision !== currentRevision});
            });
        });
    });
}

function clone(uri, checkoutPath, callback) {
    mkdirp(path.dirname(checkoutPath), function(err) {
        // TODO: handle err
        child_process.exec(util.format("git clone %s %s", uri, checkoutPath), function(err) {
            callback(err, {updated: true});
        });
    });
}

function gitRevision(path, callback) {
    child_process.exec("git rev-parse HEAD", {cwd: path}, function(err, stdout, stderr) {
        var revision = trim(stdout);
        callback(err, revision);
    });
}

function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
