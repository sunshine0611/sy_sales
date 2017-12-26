var config = require('../etc/config.json')
var dbscriptCfg = require('../etc/dbscript.json')

exports.initDB = function(){
  //check database file
  /*var curDir = process.cwd()
  fs.exists(path.join(curDir, '/test.db'), function(is_exists){
    if (!is_exists){
      var sqlite3 = require('sqlite3').verbose();
      var db = new sqlite3.Database("test.db");
    }
    console.log(is_exists ? 'exists' : 'not exists')
  })*/
  var sqlite3 = require('sqlite3').verbose()
  var db = new sqlite3.Database("sales.db")
  if (dbscriptCfg){
    for(var i = 0; i < dbscriptCfg.tables.length; i++ ){
      var tableInfo = dbscriptCfg.tables[i];
      if (tableInfo.create_sql){
        db.run(tableInfo.create_sql)
      }
    }
  }
  db.close()
}