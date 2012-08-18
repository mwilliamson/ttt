var path = require("path");

var systems = [
    require("./git")
];

exports.fetchRepository = fetchRepository;

function fetchRepository(project, repository, callback) {
    var checkoutPath = path.join(project.path, repository.checkout);
    
    var system = find(systems, function(system) {
        return system.handlesUri(repository.uri);
    });
    
    if (system === null) {
        throw new Error("Unrecognised source control URI: " + repository.uri);
    } else {
        system.fetchRepository(repository.uri, checkoutPath, callback);
    }
}

function find(iterable, predicate) {
    var result = iterable.filter(predicate);
    if (result.length === 0) {
        return null;
    } else {
        return result[0];
    }
}
