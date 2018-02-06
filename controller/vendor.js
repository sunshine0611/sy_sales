var config = require('../etc/config.json')
var express = require('express')
var router = express.Router()
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncVendor', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].UpdateDate = new Date();
  dbtool.replaceBatchModel('Vendor', datas, 'ID', 'VendorCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/getSyncVendors',function(req, res, next){
  dbtool.getWhere('Vendor', "UpdateDate >= str_to_date(?, '%Y-%m-%d %H:%i:%s')", [req.body.LastUpdateTime], 'VendorCode,VendorName,VendorType,ListColor,LegalPerson,FreightStation,FreightCharge,Description,EnableFlag').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateVendors', function(req, res, next){
  dbtool.getWhere('Vendor', 'UpdateDate >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getVendors', function(req, res, next){
  dbtool.getByPage('Vendor', '', [], 1, 20, 'id desc').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;