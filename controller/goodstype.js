var config = require('../etc/config.json')
var express = require('express')
var router = express.Router()
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncGoodsType', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].UpdateDate = new Date();
  dbtool.replaceBatchModel('GoodsType', datas, 'ID', 'TypeCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/getSyncGoodsTypes',function(req, res, next){
  dbtool.getWhere('GoodsType', "UpdateDate >= str_to_date(?, '%Y-%m-%d %H:%i:%s')", [req.body.LastUpdateTime], 'ParentCode,TypeCode,TypeName,TypeOrder,TypeProperty,TypeLevel,Description,EnableFlag').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateGoodsType', function(req, res, next){
  dbtool.getWhere('GoodsType', 'UpdateDate >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;
