var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
var redis = require('../utils/redis')

router.get('/setUserName',function(req, res, next){
  //redis.set("user_name", "sinsun", 300)
  var dbtool = require('../utils/dbtool')
  /*dbtool.getAll("lorem").then(data=>{
    res.send(data)
  })*/
  dbtool.getByPage("lorem", "", [], 2, 12).then(data=>{
    res.send(data)
  })
})

module.exports = router;