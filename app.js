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
, username          = "goodybag"
, password          = "g00d"
, connectionString  = 'mongodb://' + username + ':' + password + '@w-mongos0.objectrocket.com:10000/testme'
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
      fs.writeFile(path, JSON.stringify(previousResults, null, "  "), function(error){
        if (error) throw error;
        process.exit(0);
      });
    });
  }
, insert = function(which){
    return function(deferred){
      count++;
      api[which].businesses.add(data.getBusiness(), function(error){
        error && console.log(error);
        deferred.resolve();
      });
    };
  }
, one = function(which, cb){
    // insert first
    api[which].businesses.add(data.getBusiness(), function(e, b){
      if (e) throw new Error(e.message);
      cb(function(deferred){
        api[which].businesses.one(b._id, function(error, business){
          error && console.log(error);
          deferred.resolve();
        });
      });
    });
  }
, getSome = function(which){
    return function(deferred){
      api[which].businesses.get({ limit: 100, skip: 20 }, function(error, business){
        error && console.log(error);
        deferred.resolve();
      });
    };
  }
, getOptions = function(fn){
    return {
      defer: true
    // , async: true
    , maxTime: 30
    , minSamples: 100
    , fn: fn
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
     suiteJs.add('MongoJs Inserting', getOptions(insert('js')));
     suiteDe.add('MongoDe Inserting', getOptions(insert('de')));
     suiteJs.add('MongoJs Getting 100 Docs', getOptions(getSome('js')));
     suiteDe.add('MongoDe Getting 100 Docs', getOptions(getSome('de')));

    one('js', function(fn){
      suiteJs.add('MongoJs Get One Record', getOptions(fn));
      if (setupReady('js')) cb();
    });

    one('de', function(fn){
      suiteDe.add('MongoDe Get One Record', getOptions(fn));
      if (setupReady('de')) cb();
    });

    suiteDe.on('complete', complete);
    suiteJs.on('complete', complete);
  }

;

setup(function(){
  console.log("Testing mongo" + whichOne);
  if (whichOne == "de"){
    suiteDe.run();
  }else{
    suiteJs.run();
  }
});
