/*
  API - Base API
*/

var
  schemas   = require('../schemas')
, ObjectId  = require('mongodb').ObjectId
, sugar     = require('sugar')
;

/**
 * Constructor for the Base API class
 * @param  {String}   collection  ObjectId
 * @return {instance of api}
 */
var Api = function(db, collection){
  this.collection = db.collection(collection);
};

Api.prototype = {
  /**
   * Does common cursor options (limit, skip, sort)
   * @param  {ObjectId} id       Id of the item
   * @param  {Object}   fields   fields to return.
   * @param  {Function} callback returns the error/data.
   * @return {Object}   query    mongo query object
   */
  parseCursors: function(options, query, callback){
    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);
    if (options.sort) query.sort(options.sort.field, options.sort.direction);
    return query;
  }

  /**
   * Grab single item from collection by ObjectId
   * @param  {ObjectId/query} id       Id of the item or just query obj
   * @param  {Object}         fields   fields to return.
   * @param  {Function}       callback returns the error/data.
   * @return {null}
   */
, one: function(id, fields, callback){
    if (Object.isFunction(fields)){
      callback = fields;
      fields = {};
    }
    if (Object.isString()){
      id = new ObjectId(id);
    }
    // id might be some other query
    this.collection.findOne((id instanceof ObjectId) ? { _id: id } : id, fields, callback);
  }

  /**
   * Query collection
   * @param  {object}   options  query options
   * @param  {Object}   fields   fields to return.
   * @param  {Function} callback returns the error/data.
   * @return {null}
   */
, get: function(options, fields, callback){
    if (Object.isFunction(options)){
      callback = options;
      options = {};
      fields = {};
    }else if (Object.isFunction(fields)){
      callback = fields;
      fields = {};
    }
    var query = this.collection.find({ _id: id }, fields);
    query = this.parseCursors(options, query);
    query.toArray(callback);
  }

  /**
   * Adds item to collection
   * @param  {object}   data     item to be added to the collection
   * @param  {Function} callback returns the error/item.
   * @return {null}
   */
, add: function(data, callback){
    this.collection.insert(data, callback || function(){});
  }

  /**
   * Removes an item from the collection
   * @param  {Object/ObjectId}  query    ObjectId of item/Query for items to be removed
   * @param  {Function}         callback returns the error/item.
   * @return {null}
   */
, remove: function(query, callback){
    if (typeof query == "string"){
      query = new ObjectId(query);
    }
    if (query instanceof ObjectId){
      query = { _id: query };
    }
    this.collection.remove(query, callback || function(){});
  }

  /**
   * Flattens a query object to be used with mongo queries { "some.thing.else": "blah" }
   * @param  {Object}  doc        The nested query object to be flattened
   * @param  {String}  startPath  Top level key
   * @return {Object}  The flattened document
   */
, flattenDoc: function(doc, startPath){
    var flat = {},
    flatten = function(obj, path){
      if (Object.isObject(obj)){
        (path && (path += ".")) || (path = "");
        for (var key of obj) flatten(obj[key], path + key);
      }else if (Object.isArray(obj)){
        (path && (path += ".")) || (path = "");
        i = 0;
        while (i < obj.length){
          flatten(obj[i], path + i);
          i++;
        }
      }else{
        flat[path] = obj;
      }
      return flat;
    }
    return flatten(doc, startPath);
  }
};

module.exports.Api = Api;