Backbone SimpleDB
-----------------
Server-side overrides for Backbone to use `simpledb` for Model persistence.

### Installation

    npm install backbone-simpledb

### Usage

Pass an `options` object when calling `require()`. `backbone-simpledb` exports
an SimpleDB `sdb` instance and a `sync` method that you can use to override
`Backbone.sync` or `Model.sync` for individual models.

    var Backbone = require('backbone');
    Backbone.sync = require('backbone-simpledb')({
        keyid: 'MyAmazonID',
        secret: 'MyAmazonSecretKey',
        domain: 'testdb'
    }).sync;

    // Backbone.sync will now load and save models from the `testdb` domain

### Conventions

`backbone-simpledb` stores models in the db using the `model.url` as its key.
Collections retrieve models by matching the Collection url against the
initial portion of the Model url.

    var orange = new FruitModel({id: 'orange'});
    var apple = new FruitModel({id: 'apple'});
    var banana = new FruitModel({id: 'banana'});

    console.log(orange.url()); // fruits/orange
    console.log(apple.url());  // fruits/apple
    console.log(banana.url()); // fruits/banana

    var fruits = new FruitCollection();

    console.log(fruits.url);   // fruits

    fruits.fetch();            // retrieves orange, apple, banana

### Limitations

`backbone-simpledb` does not attempt to overcome any of SimpleDB's inherent
limitations. In particular

- Each model is restricted to 256 attributes
- Each attribute is restricted to 1024 bytes of data

In addition, model attributes are stored using `JSON.stringify` in order to
overcome SimpleDB's string-only attribute datatypes. This further reduces the
available space per attribute for data.

### Authors

- [Will White](http://github.com/willwhite)
- [Young Hahn](http://github.com/yhahn)

