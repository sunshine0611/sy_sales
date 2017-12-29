var config = require('../etc/config.json')
var express = require('express')
var router = express.Router()
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncVendor', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].LastUpdateTime = new Date();
  dbtool.replaceBatchModel('Vendor', datas, 'ID', 'VendorCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateVendors', function(req, res, next){
  dbtool.getWhere('Vendor', 'LastUpdateTime >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;