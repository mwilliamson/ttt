var path = require("path");

var git = require("./git");

var systems = [
    require("./git")
];

exports.fetchRepository = fetchRepository;

function fetchRepository(project, repository, callback) {
    var checkoutPath = path.join(project.path, repository.checkout);
    
    if (git.handlesUri) {
        git.fetchRepository(repository.uri, checkoutPath, callback);
    } else {
        throw new Error("Unrecognised source control URI: " + repository.uri);
    }
}
