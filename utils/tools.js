
exports.isNullOrEmpty = function(obj){
  return obj == null || obj == undefined || (typeof obj == "string" && obj.replace(/\s*/g, "") == "") ;
}

exports.createError = function(err){
  return { code: -1, msg: err }
}