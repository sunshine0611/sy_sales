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

router.post('/addGoods',function(req, res, next){
  dbtool.insertModel('Goods', req.body, 'ID', 'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/updateGoods',function(req, res, next){
  dbtool.updateModel('Goods', req.body, ['ModelName','ShortName','TypeCode','DistrictNo'], 'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getGoods',function(req, res, next){
  dbtool.getAll('Goods').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getGoods/:id',function(req, res, next){
  dbtool.getEntityById('Goods', req.params.id ,'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getGoods/:pid/:psize',function(req, res, next){
  dbtool.getByPage('Goods', '', [], req.params.pid, req.params.psize, 'id desc').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/SyncGoods', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].LastUpdateTime = new Date();
  dbtool.replaceBatchModel('Goods', datas, 'ID', 'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateGoodss', function(req, res, next){
  dbtool.getWhere('Goods', 'LastUpdateTime >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;