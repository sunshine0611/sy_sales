var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

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

router.post('/UpdateGoods', function(req, res, next){
  var datas = req.body;
  dbtool.replaceBatchModel('Goods', datas, 'ID', 'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;