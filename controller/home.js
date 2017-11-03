var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
//var sqlite3 = require("sqlite3").verbose();

router.get('/setData',function(req, res, next){
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database("test.db");

  /*db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        console.log(row.id + ": " + row.info);
    });
  });*/
  db.serialize(function() {
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        console.log(row.id + ": " + row.info);
    });
  });

  db.close();
  res.send('data')
})

module.exports = router;