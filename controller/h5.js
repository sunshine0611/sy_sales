var config = require('../etc/config.json')
var express = require('express')
var router = express.Router()
var redis = require('../utils/redis')
var dbtool = require('../utils/dbtool')

router.get('/', function(req, res, next){
  res.render('./h5/index.html')
})

router.get('/index', function(req, res, next){
  res.render('./h5/index.html')
})

router.get('/guest', function(req, res, next){
  res.render('./h5/guest.html')
})

router.get('/vendor', function(req, res, next){
  res.render('./h5/vendor.html')
})

router.get('/competitor', function(req, res, next){
  res.render('./h5/competitor.html')
})

module.exports = router