var
  // Module Dependencies
  mongojs   = require('mongojs')
, mongode   = require('mongode')
, fs        = require('fs')
, Benchmark = require('benchmark')
, Api       = require('./Api').Api
, data      = require('./data')

  // Module variables
, connectionString  = 'mongodb://127.0.0.1:1337/goodybag'
, dbjs              = mongojs.connect(connectionString)
, dbde              = mongode.connect(connectionString)
, suiteJs           = new Benchmark.Suite
, suiteDe           = new Benchmark.Suite
, count             = 0
, api = {
    js: {
      businesses: new Api(dbjs, 'businesses')
    }
  , de: {
      businesses: new Api(dbde, 'businesses')
    }
  }
, complete = function(){
    console.log(this.filter('successful'));
    console.log(count);
    process.exit(0);
  }
, insert = function(which){
    return function(){
      count++;
      api[which].businesses.add(data.getBusiness(), function(error){
        if (error) {
          console.log(error);
          throw new Error(error.message);
        }
      });
    };
  }
, one = function(which, cb){
    // insert first
    api[which].businesses.add(data.getBusiness(), function(e, b){
      if (e) throw new Error(e.message);
      cb(function(){
        api[which].businesses.one(b._id, function(error, business){
          error && console.log(error);
        });
      });
    });
  }
, setup = function(cb){
    var
      jsReady = false
    , deReady = false
    ;
    // suiteJs.add('MongoJs Inserting', insert('js'));
    // suiteDe.add('MongoDe Inserting', insert('de'));

    one('js', function(fn){
      console.log(fn);
      suiteJs.add('MongoJs Get One Record', fn);
      jsReady = true;
      if (deReady) cb();
    });

    one('de', function(fn){
      suiteDe.add('MongoDe Get One Record', fn);
      deReady = true;
      if (jsReady) cb();
    });

    suiteDe.on('complete', complete);
    suiteJs.on('complete', complete);
  }

, options = {
    async: true
  }
;

setup(function(){
  if (process.argv[2] == "de"){
    suiteDe.run(options);
  }else{
    suiteJs.run(options);
  }
});
