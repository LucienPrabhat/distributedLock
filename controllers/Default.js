let utils = require('../utils/writer.js');
let Default = require('../service/DefaultService');

//functions
function _response(response){
  utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
}

function _errHandler(response){
  utils.writeJson(res, response);
}


//MUTEX

module.exports.lockMutex = function lockMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexttl = req.swagger.params['mutexttl'].value;
  Default.lockMutex(mutexKey,mutexttl).then(_response).catch(_errHandler);
};

module.exports.unlockMutex = function unlockMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexHandle = req.swagger.params['mutexHandle'].value;
  Default.unlockMutex(mutexKey,mutexHandle).then(_response).catch(_errHandler);
};

module.exports.extendMutex = function extendMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexArg = req.swagger.params['mutexArg'].value;
  Default.extendMutex(mutexKey,mutexArg).then(_response).catch(_errHandler);
};

module.exports.queryMutex = function queryMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  Default.queryMutex(mutexKey).then(_response).catch(_errHandler);
};


//SEMAPHORE

module.exports.createSema = function createSema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaLockargs = req.swagger.params['semaLockargs'].value;
  Default.createSema(semaKey,semaLockargs).then(_response).catch(_errHandler);
};

module.exports.deleteSema = function deleteSema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  Default.deleteSema(semaKey).then(_response).catch(_errHandler);
};

module.exports.aquireSeat = function aquireSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaSeatttl = req.swagger.params['semaSeatttl'].value;
  Default.aquireSeat(semaKey,semaSeatttl).then(_response).catch(_errHandler);
};

module.exports.releaseSeat = function releaseSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let SemaHandle = req.swagger.params['SemaHandle'].value;
  Default.releaseSeat(semaKey,SemaHandle).then(_response).catch(_errHandler);
};

module.exports.postponeSeat = function postponeSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaSeatArgs = req.swagger.params['semaSeatArgs'].value;
  Default.postponeSeat(semaKey,semaSeatArgs).then(_response).catch(_errHandler);
};

module.exports.querySema = function querySema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  Default.querySema(semaKey).then(_response).catch(_errHandler);
};

