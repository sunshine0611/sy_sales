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
  defer.resolve({code:1, data:null})
  return defer.promise
}

exports.replaceBatchModel = function(table, entitys, identity, key){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject("table is required")
  }
  if (tools.isNullOrEmpty(entitys)){
    return defer.reject("entitys is required")
  }
  try{
    var db = openDb()
    var keys = "";
    for(var i = 0; i < entitys.length; i++){
      keys += "'" + entitys[i][key] + "',";
    }
    keys = tools.trim(keys, ",");
    db.serialize(function() {
      db.all(`select * from ${table} where ${key} in (${keys}) `, function(err, res){
        if (err){
          return defer.reject(err)
        }
        var oldData = {};
        for(var i = 0; i < res.length; i++){
          oldData[res[i][key]] = res[i];
        }
        var updStmt = db.prepare(getUpdateSql(table, entitys[0], identity, key))
        var insStmt = db.prepare(getInsertSql(table, entitys[0], identity, key))
        for(var i = 0; i < entitys.length; i++){
          var entity = entitys[i];
          if (oldData[entity[key]]){ //update
            updStmt.run(getUpdateVal(entity, identity, key))
          }else{ // insert
            insStmt.run(getInsertVal(entity, identity))
          }
        }
        updStmt.finalize()
        insStmt.finalize()
        db.close()
        defer.resolve({code:1, data:null})
      })
    })
    
  }catch(e){
    return defer.reject("update error")
  }
  return defer.promise
}

var getUpdateSql = function(table, entity, identity, key){
  var stmt = `update ${table} set `;
  for(var field in entity){
    if (field == identity || field == key)continue;
    stmt += ` ${field} = ?,`;
  }
  stmt = tools.trim(stmt, ',') + ` where ${key} = ?`;
  return stmt;
}
var getUpdateVal = function(entity, identity, key){
  var vals = [];
  for(var field in entity){
    if (field == identity || field == key)continue;
    vals.push(entity[field]);
  }
  vals.push(entity[key]);
  return vals;
}
var getInsertSql = function(table, entity, identity, key){
  var stmt = `insert into ${table}(`;
  var vals = "";
  for(var field in entity){
    if (field == identity)continue;
    stmt += ` ${field},`;
    vals += " ?,";
  }
  stmt = tools.trim(stmt, ',') + ') values(' + tools.trim(vals, ',') + ');';
  return stmt;
}
var getInsertVal = function(entity, identity){
  var vals = [];
  for(var field in entity){
    if (field == identity)continue;
    vals.push(entity[field])
  }
  return vals;
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

exports.getWhere = function(table, where, vals){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  var db = openDb()
  db.all(`select * from ${table} ` + (tools.isNullOrEmpty(where) ? '' : where), vals, function(err, res){
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