var
  // Module Dependencies
  mongojs   = require('mongojs')
, mongode   = require('mongode')
, fs        = require('fs')
, Benchmark = require('benchmark')
, Api       = require('./Api').Api
, data      = require('./data')

  // Module variables
, whichOne          = process.argv[2]
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
    var
      tests = this.filter('successful')
    , path  = './results/' + whichOne + '.json'
    ;
    console.log(tests);

    fs.readFile(path, function(error, data){
      var previousResults;
      if (!error){
        previousResults = JSON.parse(data.toString());
      }else{
        previousResults = [];
      }
      previousResults.push(tests);
      fs.writeFile(path, JSON.stringify(previousResults), function(error){
        if (error) throw error;
        process.exit(0);
      });
    });
  }
, insert = function(which){
    return function(){
      count++;
      api[which].businesses.add(data.getBusiness(), function(error){
        if (error) {
          console.log(error);
          throw error;
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
, getSome = function(which){
    return function(){
      api[which].businesses.get({ limit: 100, skip: 20 }, function(error, business){
        error && console.log(error);
      });
    };
  }
, setup = function(cb){
    var
      setupReadyConditions = [
        'js'
      , 'de'
      ]
    , readies = []
    , setupReady = function(depend){
        readies.push(depend);
        for (var i = 0; i < setupReadyConditions.length; i++){
          if (readies.indexOf(setupReadyConditions[i]) == -1) return false;
        }
        return true;
      }
    ;
     suiteJs.add('MongoJs Inserting', insert('js'));
     suiteDe.add('MongoDe Inserting', insert('de'));
     suiteJs.add('MongoJs Getting 100 Docs', insert('js'));
     suiteDe.add('MongoDe Getting 100 Docs', insert('de'));

    one('js', function(fn){
      suiteJs.add('MongoJs Get One Record', fn);
      if (setupReady('js')) cb();
    });

    one('de', function(fn){
      suiteDe.add('MongoDe Get One Record', fn);
      if (setupReady('de')) cb();
    });

    suiteDe.on('complete', complete);
    suiteJs.on('complete', complete);
  }

, options = {
    async: true
  }
;

setup(function(){
  console.log("Testing mongo" + whichOne);
  if (whichOne == "de"){
    suiteDe.run(options);
  }else{
    suiteJs.run(options);
  }
});
