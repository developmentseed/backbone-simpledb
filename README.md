Backbone SimpleDB
-----------------
Server-side overrides for Backbone to use `simpledb` for Model persistence.

### Compatibility

    joyent node v0.2.6
    documentcloud backbone 0.3.3
    rjrodger simpledb 0.0.5
    mirkok aws-lib v0.0.4

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

`backbone-dirty` stores models in the `node-dirty` db using the `model.url` as
its key. Collections retrieve models by matching the Collection url against
the initial portion of the Model url.

    var orange = new FruitModel({id: 'orange'});
    var apple = new FruitModel({id: 'apple'});
    var banana = new FruitModel({id: 'banana'});

    console.log(orange.url()); // fruits/orange
    console.log(apple.url());  // fruits/apple
    console.log(banana.url()); // fruits/banana

    var fruits = new FruitCollection();

    console.log(fruits.url);   // fruits

    fruits.fetch();            // retrieves orange, apple, banana

### Authors

- [Will White](http://github.com/willwhite)
- [Young Hahn](http://github.com/yhahn)

