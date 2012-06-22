var
  // Module Dependencies
  mongojs   = require('mongojs')
, mongode   = require('mongode')
, fs        = require('fs')
, Benchmark = require('benchmark')
, Api       = require('./Api')
, data      = require('./data')

  // Module variables
, connectionString  = '127.0.0.1:1337/goodybag'
, dbjs              = mongojs.connect(connectionString)
, dbde              = mongode.connect(connectionString)
, suite             = new Benchmark.Suite
, api = {
    js: {
      businesses: new Api(dbjs, 'businesses')
    }
  , de: {
      businesses: new Api(dbde, 'businesses')
    }
  }
;

suite.add('MongoJs Inserting', function(){
  api.js.businesses.add(data.getBusiness());
})
.on('complete', function(){
  console.log(this.filter('successful'));
})
.run();