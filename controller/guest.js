var config = require('../etc/config.json');
var express = require('express');
var router = express.Router();
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.post('/SyncGuests', function(req, res, next){
  var datas = req.body;
  for(var i = 0; i < datas.length; i++) datas[i].LastUpdateTime = new Date();
  dbtool.replaceBatchModel('Guest', datas, 'ID', 'GuestCode').then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

router.get('/getGuests', function(req, res, next){
  res.send([{GuestName:"sinsun", Phone:"123123234", Sex:"nan", Address:""}])
})

router.get('/LastUpdateGuests', function(req, res, next){
  dbtool.getWhere('Guest', 'LastUpdateTime >= ?', req.params.lasttime).then(ret=>{
    res.send(ret)
  }).catch(err=>{
    res.send(err)
  })
})

module.exports = router;