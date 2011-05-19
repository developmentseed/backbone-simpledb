var _ = require('underscore')._;
    querystring = require('querystring'),
    simpledb = require('simpledb'),
    dbs = {};

module.exports = function(options) {
    if (!(options.domain && options.keyid && options.secret)) {
        throw new Error('backbone-simpledb requires { domain:[String], keyid:[String], secret:[String] }');
    }
    var sdb = dbs[options.domain] = dbs[options.domain] || new simpledb.SimpleDB(options);
    sdb.createDomain(options.domain, function(err) {
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

    // Pack/unpack objects into individually JSON stringified attributes.
    var unpack = function(data) {
        for (var key in data) {
            if (key === '$ItemName') {
                delete data[key];
            } else {
                data[key] = JSON.parse(data[key]);
            }
        }
        return data;
    };
    var pack = function(data) {
        for (var key in data) {
            data[key] = JSON.stringify(data[key]);
        }
        return data;
    };

    // Wrapper around sdb.select. Retrieves all results for a select statement,
    // making subsequent requests if a `NextToken` is returned by SimpleDB.
    // Note that at some points the result set on the initial query will
    // actually be null and only a `NextToken` will be provided.
    var select = function(q, data, next, callback) {
        var options = {};
        next && (options.next = next);
        sdb.select(q, options, function(err, result, meta) {
            result = result || [];
            data = data.concat(result);
            if (
                meta.result &&
                meta.result.SelectResult &&
                meta.result.SelectResult.NextToken
            ) {
                select(q, data, meta.result.SelectResult.NextToken, callback);
            } else {
                callback(err, data);
            }
        });
    };

    return {
        sdb: sdb,
        sync: function(method, model, success, error) {
            switch (method) {
            case 'read':
                if (model.id) {
                    sdb.getItem(
                        options.domain,
                        getUrl(model),
                        function(err, data) {
                            return data ? success(unpack(data)) : error(new Error('Model not found.'));
                        }
                    );
                } else {
                    var data = [],
                        base = getUrl(model),
                        q = 'SELECT * FROM ' + options.domain + ' WHERE ItemName() LIKE "' + base + '%"';
                    select(q, data, null, function(err, data) {
                        success(_(data).map(unpack));
                    });
                }
                break;
            case 'create':
            case 'update':
                sdb.putItem(
                    options.domain,
                    getUrl(model),
                    pack(model.toJSON()),
                    function(err) {
                        return err ? error(err) : success({});
                    }
                );
                break;
            case 'delete':
                sdb.deleteItem(
                    options.domain,
                    getUrl(model),
                    function(err) {
                        return err ? error(err) : success({});
                    }
                );
            }
        }
    }
};
