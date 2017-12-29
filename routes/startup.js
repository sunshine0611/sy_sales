var express = require('express')
    , router = express.Router();
var config = require('../etc/config.json');
var dbDal = require('../dal/db_dal')

var url_base = config.url_base;
if (url_base && url_base.length > 0 && url_base[url_base.length - 1] === '/')
    url_base = url_base.substr(0, url_base.length - 1);

// init database
dbDal.initDB();

router.get('/', function (req, res, next) {res.render('index')})

router.use('/home', require('../controller/home'))
router.use('/h5', require('../controller/h5'))
router.use('/api/goods', require('../controller/goods'))
router.use('/api/guest', require('../controller/guest'))
router.use('/api/vendor', require('../controller/vendor'))

module.exports = router