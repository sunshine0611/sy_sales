var config = require('../etc/config.json');
var comment = require('moment');
var Q = require('q');
var redis = require('redis');
var options = config.redis;
var client = redis.createClient(options);

var _this = this;

client.on("error", function(err){
  console.error("Redis error:" + err.message)
})

exports.client = client;

// 获取redis数据
exports.get = function(key){
  var defer = Q.defer();

  _this.client.get(key, function(err, data){
    if(err)return defer.resolve(null)
    return defer.resolve(data)
  })

  return defer.promise;
}

// 设置redis数据
exports.set = function(key, value, ttls){
  var data = (typeof(value)==="string"?value:JSON.stringify(value))
  if(!ttls || isNaN(ttls) || ttls < 0) ttls = 24 * 3600;
  _this.client.set(key, data)
  _this.client.expire(key, ttls)
}

// 删除
exports.del = function(key){
  _this.client.del(key)
}