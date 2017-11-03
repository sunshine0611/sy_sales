var config = require('../etc/config.json');
var comment = require('moment');
var Q = require('q');
var tools = require('./tools');
var sqlite3 = require("sqlite3").verbose();

exports.insertModel = function(table, entity, identity){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject("table is required")
  }
  if (tools.isNullOrEmpty(entity)){
    return defer.reject("entity is required")
  }
  var sql = "insert into " + table + "(";
  var columns = "", valsString = "", vals = [];
  for(var field in entity){
    if(!tools.isNullOrEmpty(identity) && identity == field) continue;
    columns += "`" + field + "`,";
    valsString += "?,";
    if (entity[field] == undefined) entity[field] = null;
    vals.push(entity[field]);
  }
  columns = columns.replace(/,$/g, "");
  valsString = valsString.replace(/,$/g, "");
  sql += columns + ") values (" + valsString + ")";
  var db = openDb()
  var stmt = db.prepare(sql)
  stmt.run(vals)
  db.close()
}

exports.updateModel = function(table, entity, columns, key){
  var db = openDb()
  var defer = Q.defer()
  var sql = "update " + table + " set ";
  var sqlSet = "", vals = [];
  if (tools.isNullOrEmpty(entity[key]))
    return defer.reject(tools.createError(key + " is required"))

  for(var i = 0; i < columns.length; i++){
    sqlSet += " " + columns[i] + " =?,";
    if (tools.isNullOrEmpty(entity[columns[i]])){
      return defer.reject(tools.createError(columns[i] + " is required"))
    }
    vals.push(entity[columns[i]])
  }
  sqlSet = sqlSet.replace(/,$/g, "")
  sql += sqlSet + " where " + key + " = ?"
  vals.push(entity[key])
  db.run(sql, vals, function(err, res){
    return defer.resolve( !err ? res : err )
  })

  db.close()
  return defer.promise
}

exports.getEntityById = function(table, val, key){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  if (tools.isNullOrEmpty(val)){
    return defer.reject(tools.createError("val should not be null"))
  }
  var db = openDb()
  if (isNullOrEmpty(key)) key = "id"
  db.all("select * from " + table + " where " + key + " = ?", function(err, res){
    return defer.resolve( !err ? res : err )
  })
  db.close()
  return defer.promise
}

exports.getAll = function(table){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  var db = openDb()
  db.all("select * from " + table, function(err, res){
    return defer.resolve( !err ? res : err )
  })
  db.close()
  return defer.promise
}

exports.getByPage = function(table, where, vals, pageIndex, pageSize, orderBy){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  pageSize = +pageSize;
  pageIndex = +pageIndex;
  if (pageIndex < 1) pageIndex = 1
  var start = pageSize * (pageIndex - 1)
  var db = openDb()
  db.all("select * from " + table + (tools.isNullOrEmpty(where) ? "" : " where " + where) + (tools.isNullOrEmpty(orderBy) ? "" : " order by " + orderBy) + " limit " + start + ", " + pageSize, vals, function(err, res){
    return defer.resolve( !err ? res : err )
  })
  db.close()
  return defer.promise
}

function openDb(){
  return new sqlite3.Database(config.db.file)
}