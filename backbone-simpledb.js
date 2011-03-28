var _ = require('underscore')._;
    querystring = require('querystring'),
    simpledb = require('simpledb'),
    dbs = {};

// Terrible, terrible hack. Overrides `querystring.escape()` to escape `(` and
// `)`. This is handled in `aws-lib` 0.0.5 which we are not using atm because
// it is node 0.4.x only. Remove this hack once we are upgraded.
// var escape = querystring.escape;
querystring.escape = _.compose(
    function(string) {
        return string.replace(/\(/g,"%28").replace(/\)/g,"%29");
    },
    querystring.escape
);

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
    var unpack = function(data) {
        return JSON.parse(data.value);
    };
    var pack = function(data) {
        return { value: JSON.stringify(data) };
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
                            return data ? success(unpack(data)) : error('Model not found.');
                        }
                    );
                } else {
                    var data = [],
                        base = getUrl(model);
                    sdb.select(
                        'SELECT * FROM ' + options.domain + ' WHERE ItemName() LIKE "' + base + '%"',
                        function(err, data) {
                            data = data || [];
                            success(_(data).map(unpack));
                        }
                    );
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
