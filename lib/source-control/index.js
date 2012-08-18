var systems = [
    require("./git")
];

exports.fetchRepository = fetchRepository;

function fetchRepository(uri, checkoutPath, callback) {
    var system = find(systems, function(system) {
        return system.handlesUri(uri);
    });
    
    if (system === null) {
        throw new Error("Unrecognised source control URI: " + uri);
    } else {
        system.fetchRepository(uri, checkoutPath, callback);
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
