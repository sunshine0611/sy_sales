var config = require('../etc/config.json');
var dbscriptCfg = require('../etc/dbscript.json')
var comment = require('moment');
var Q = require('q');
var tools = require('./tools');
var mysql = require('mysql')
var poolCfg = Object.assign({
  connectionLimit: 10,
  multipleStatements: true,
  charset: 'utf8',
  collate: 'utf8_general_ci'
}, config.db.conn)
var pool = mysql.createPool(poolCfg)

pool.on('connection', function(connection){
  //console.log(`[pid: ${process.pid}]Connected as id ${connection.threadId}`)
})
pool.on('release', function(connection){
  //console.log(`[pid: ${process.pid}]Connection ${connection.threadId} released`)
})

var _this = this;
var run = function(sql, vals, cb){
  pool.getConnection(function(err, conn){
    if(err){
      if(conn) conn.release();
      cb && cb(err);
    } else{
      conn.query({sql:sql, values: vals, timeout: 60000}, function(err, result, fields){
        conn.release()
        cb && cb(err, result, fields)
      })
    }
  })
}

exports.initDB = function(){
  if (dbscriptCfg){
    for(var i = 0; i < dbscriptCfg.tables.length; i++ ){
      var tableInfo = dbscriptCfg.tables[i];
      if (tableInfo.create_sql){
        run(tableInfo.create_sql, [], function(err, result){
          if (err) console.log(`init table err:` + err)
        })
      }
    }
  }
}

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
  run(sql, vals, function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
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
    pool.getConnection(function(conErr, conn){
      if(conErr){
        if(conn) conn.release()
        return defer.reject(conErr)
      } else{
        conn.beginTransaction(function(errTrans){
          if (errTrans){
            conn.release()
            return defer.reject(errTrans)
          }
          var insSql = getInsertSql(table, entitys[0], identity, key)
          var updSql = getUpdateSql(table, entitys[0], identity, key)

          var queryOne = function(entitys, idx){
            var vals = getInsertVal(entitys[idx], identity, key)
            conn.query(insSql + ' on duplicate key ' + updSql , vals, function(errQ, info){
              if (errQ){
                conn.rollback(function(){ conn.release(); return defer.reject(errQ) })
              }
              else{
                if (idx < entitys.length - 1){
                  queryOne(entitys, idx + 1)
                }else{
                  conn.commit(function(errCom){
                    if (errCom)
                      conn.rollback(function(){ conn.release(); return defer.reject(errCom) })
                    else{
                      conn.release()
                      return defer.resolve({code:1, data:null})
                    }
                  })
                }
              }
            })
          }
          queryOne(entitys, 0)
        })
      }
    })
  }catch(e){
    return defer.reject("update error")
  }
  return defer.promise
}

var getUpdateSql = function(table, entity, identity, key){
  var stmt = `update `;
  for(var field in entity){
    if (field == identity || field == key)continue;
    stmt += ` ${field} = values(${field}),`;
  }
  stmt = tools.trim(stmt, ',');
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
  stmt = tools.trim(stmt, ',') + ') values(' + tools.trim(vals, ',') + ')';
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
  run(sql, vals, function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
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
  if (tools.isNullOrEmpty(key)) key = "id"
  run(`select * from ${table} where ${key} = ?`, [val], function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
  return defer.promise
}

exports.getAll = function(table){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  run(`select * from ${table} `, [], function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
  return defer.promise
}

exports.getWhere = function(table, where, vals){
  var defer = Q.defer()
  if (tools.isNullOrEmpty(table)){
    return defer.reject(tools.createError("table should not be null"))
  }
  run(`select * from ${table} ` + (tools.isNullOrEmpty(where) ? '' : where), [vals], function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
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
  run("select * from " + table + (tools.isNullOrEmpty(where) ? "" : " where " + where) + (tools.isNullOrEmpty(orderBy) ? "" : " order by " + orderBy) + " limit " + start + ", " + pageSize, vals, function(err, result, fields){
    return defer.resolve(!err ? {code:1, data:result} : {code:-1, data:err} )
  })
  return defer.promise
}
