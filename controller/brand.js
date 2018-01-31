var config = require('../etc/config.json')
var express = require('express')
var router = express.Router()
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncBrand', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].UpdateDate = new Date();
  dbtool.replaceBatchModel('Brand', datas, 'ID', 'BrandCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/getSyncBrands',function(req, res, next){
  dbtool.getWhere('Brand', "UpdateDate >= str_to_date(?, '%Y-%m-%d %H:%i:%s')", [req.body.LastUpdateTime], 'BrandCode,VendorCode,BrandName,BrandOrder,Description,EnableFlag').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateBrands', function(req, res, next){
  dbtool.getWhere('Vendor', 'UpdateDate >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;
