let utils = require('../utils/writer.js');
let Default = require('../service/DefaultService');
let _res;

//param wrapper
function _param(req,res,param1,param2){
  _res=res;
  if(param2===undefined) return [req.swagger.params[param1].value];
  return [req.swagger.params[param1].value,req.swagger.params[param2].value];
}
//reaponse wrapper
function _response(response){
  utils.writeJson(_res, {"message":response['msg']}, response['statusCode']);
}
function _errHandler(response){
  utils.writeJson(_res, response);
}


//MUTEX
function lockMutex (req, res, next) {
  let param=_param(req,res,'mutexKey','mutexttl')
  Default.lockMutex(param[0],param[1]).then(_response).catch(_errHandler);
};
function unlockMutex (req, res, next) {
  let param=_param(req,res,'mutexKey','mutexHandle')
  Default.unlockMutex(param[0],param[1]).then(_response).catch(_errHandler);
};
function extendMutex (req, res, next) {
  let param=_param(req,res,'mutexKey','mutexArg')
  Default.extendMutex(param[0],param[1]).then(_response).catch(_errHandler);
};
function queryMutex (req, res, next) {
  let param=_param(req,res,'mutexKey')
  Default.queryMutex(param[0]).then(_response).catch(_errHandler);
};


//SEMAPHORE
function createSema (req, res, next) {
  let param=_param(req,res,'semaKey','semaLockargs')
  Default.createSema(param[0],param[1]).then(_response).catch(_errHandler);
};
function deleteSema (req, res, next) {
  let param=_param(req,res,'semaKey')
  Default.deleteSema(param[0]).then(_response).catch(_errHandler);
};
function aquireSeat (req, res, next) {
  let param=_param(req,res,'semaKey','semaSeatttl')
  Default.aquireSeat(param[0],param[1]).then(_response).catch(_errHandler);
};
function releaseSeat (req, res, next) {
  let param=_param(req,res,'semaKey','SemaHandle')
  Default.releaseSeat(param[0],param[1]).then(_response).catch(_errHandler);
};
function postponeSeat (req, res, next) {
  let param=_param(req,res,'semaKey','semaSeatArgs')
  Default.postponeSeat(param[0],param[1]).then(_response).catch(_errHandler);
};
function querySema (req, res, next) {
  let param=_param(req,res,'semaKey')
  Default.querySema(param[0]).then(_response).catch(_errHandler);
};

module.exports={
  lockMutex,
  unlockMutex,
  extendMutex,
  queryMutex,
  createSema,
  deleteSema,
  aquireSeat,
  releaseSeat,
  postponeSeat,
  querySema,
}

