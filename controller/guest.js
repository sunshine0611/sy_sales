var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncGuests', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].UpdateDate = new Date();
  dbtool.replaceBatchModel('Guest', datas, 'ID', 'GuestCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getGuests', function(req, res, next){
  dbtool.getByPage('Guest', '', [], req.query.pno, 20, 'id desc').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.post('/getSyncGuests',function(req, res, next){
  dbtool.getWhere('Guest', "UpdateDate >= str_to_date(?, '%Y-%m-%d %H:%i:%s')", [req.body.LastUpdateTime], 'GuestCode,GuestName,DeptCode,DeptName,Alias,ListColor,EnableFlag').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/LastUpdateGuests', function(req, res, next){
  dbtool.getWhere('Guest', 'UpdateDate >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;