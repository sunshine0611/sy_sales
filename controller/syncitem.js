var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')
var tools = require('../utils/tools')
var hasNewUpdate = false

router.get('/getSyncItems',function(req, res, next){
  if (hasNewUpdate == false){
    return res.send({code:0, data:null})
  }
  var bizTypes = req.params.ReqTypes
  var queryStr = tools.isNullOrEmpty(bizTypes) ? '' : " and BizType in ('" + bizTypes.replace(/,/g, "','") + "') ";
  dbtool.getWhere('SyncItem', 'EnableFlag = ?' + queryStr, [0]).then(data=>{
    res.send(data)
  })
})

router.post('/addSyncItem',function(req, res, next){
  req.body.SyncCode = tools.uuid().replace(/\-/g,'')
  req.body.EnableFlag = 0
  req.body.CreateDate = req.body.UpdateDate = new Date()
  dbtool.insertModel('SyncItem', req.body, 'ID').then(ret=>{
    res.send(ret)
    hasNewUpdate = true
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/endSyncItems', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++){
    datas[i].UpdateDate = new Date()
    datas[i].EnableFlag = 1
  }
  dbtool.replaceBatchModel('SyncItem', datas, 'ID', 'SyncCode').then(ret=>{
    res.send(ret)
    hasNewUpdate = false
  }).catch(err=>{
    res.send(err)
  })
})


/*router.post('/updateSyncItem',function(req, res, next){
  req.body.UpdateDate = new Date()
  req.body.EnableFlag = 1
  dbtool.updateModel('SyncItem', req.body, ['EnableFlag','UpdateDate'], 'GoodsCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})*/

module.exports = router;