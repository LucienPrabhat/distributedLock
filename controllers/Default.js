let utils = require('../utils/writer.js');
let Default = require('../service/DefaultService');


//MUTEX

module.exports.lockMutex = function lockMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexttl = req.swagger.params['mutexttl'].value;
  Default.lockMutex(mutexKey,mutexttl)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.unlockMutex = function unlockMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexHandle = req.swagger.params['mutexHandle'].value;
  Default.unlockMutex(mutexKey,mutexHandle)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.extendMutex = function extendMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  let mutexArg = req.swagger.params['mutexArg'].value;
  Default.extendMutex(mutexKey,mutexArg)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.queryMutex = function queryMutex (req, res, next) {
  let mutexKey = req.swagger.params['mutexKey'].value;
  Default.queryMutex(mutexKey)
    .then(function (response) {
      utils.writeJson(res, {"message":msg}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};



//SEMAPHORE

module.exports.createSema = function createSema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaLockargs = req.swagger.params['semaLockargs'].value;
  Default.createSema(semaKey,semaLockargs)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteSema = function deleteSema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  Default.deleteSema(semaKey)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.aquireSeat = function aquireSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaSeatttl = req.swagger.params['semaSeatttl'].value;
  Default.aquireSeat(semaKey,semaSeatttl)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.releaseSeat = function releaseSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let SemaHandle = req.swagger.params['SemaHandle'].value;
  Default.releaseSeat(semaKey,SemaHandle)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.postponeSeat = function postponeSeat (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  let semaSeatArgs = req.swagger.params['semaSeatArgs'].value;
  Default.postponeSeat(semaKey,semaSeatArgs)
    .then(function (response) {
    utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.querySema = function querySema (req, res, next) {
  let semaKey = req.swagger.params['semaKey'].value;
  Default.querySema(semaKey)
    .then(function (response) {
      utils.writeJson(res, {"message":msg}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

