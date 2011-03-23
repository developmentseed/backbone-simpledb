var simpledb = require('node-simpledb');

module.exports = function(settings) {
    var sdb = new simpledb.SimpleDB({keyid: settings.aws_key, secret: settings.aws_secret});
    sdb.createDomain(settings.simpledb_domain, function(err) {
        if (err) throw err;
    });

    // Helper function to get a URL from a Model or Collection as a property
    // or as a function.
    var getUrl = function(object) {
        if (object.url instanceof Function) {
            return object.url();
        } else if (typeof object.url === 'string') {
            return object.url;
        }
    };

    return {
        sync: function(method, model, success, error) {
            switch (method) {
            case 'read':
                var data,
                    base = getUrl(model);
                if (model.id) {
                    sdb.getItem(settings.simpledb_domain, base, function(err, data) {
                        return data ? success(data) : error('Model not found.');
                    });
                } else {
                    return error('Not supported yet.');
                }
                break;
            case 'create':
            case 'update':
                sdb.putItem(
                    settings.simpledb_domain,
                    getUrl(model),
                    model.toJSON(),
                    function(err) {
                        return err ? error(err) : success({});
                    }
                );
                break;
            }
        }
    }
}
