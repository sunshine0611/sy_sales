
exports.isNullOrEmpty = function(obj){
  return obj == null || obj == undefined || (typeof obj == "string" && obj.replace(/\s*/g, "") == "") ;
}

exports.createError = function(err){
  return { code: -1, msg: err }
}

exports.trim = function(str, chr){
  return str == null || str == "" ? "" : str.replace(new RegExp("^"+chr+"+|"+chr+"+$","g"), "");
}