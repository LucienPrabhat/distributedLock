'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');


//MUTEX

module.exports.lockMutex = function lockMutex (req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexttl = req.swagger.params['mutexttl'].value;
  Default.lockMutex(mutexKey,mutexttl)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.unlockMutex = function unlockMutex (req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexHandle = req.swagger.params['mutexHandle'].value;
  Default.unlockMutex(mutexKey,mutexHandle)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.extendMutex = function extendMutex (req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  var mutexHandle = req.swagger.params['mutexHandle'].value;
  var mutexttl = req.swagger.params['mutexttl'].value;
  Default.extendMutex(mutexKey,mutexHandle,mutexttl)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.queryMutex = function queryMutex (req, res, next) {
  var mutexKey = req.swagger.params['mutexKey'].value;
  Default.queryMutex(mutexKey)
    .then(function (response) {
      let msg={
        "id":response['msg'][0]['data']['id'],
        "expiry":response['msg'][0]['data']['expiry']
      };
      utils.writeJson(res, {"message":msg}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};



//SEMAPHORE

module.exports.createSema = function createSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaArgs = req.swagger.params['semaArgs'].value;
  Default.createSema(semaKey,semaArgs)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteSema = function deleteSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  Default.deleteSema(semaKey,semaHandle)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.lockSema = function lockSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  var semattl = req.swagger.params['semattl'].value;
  Default.lockSema(semaKey,semaHandle,semattl)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.releaseSema = function releaseSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  Default.releaseSema(semaKey,semaHandle)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.extendSema = function extendSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  var semattl = req.swagger.params['semattl'].value;
  Default.extendSema(semaKey,semaHandle,semattl)
    .then(function (response) {
      utils.writeJson(res, {"message":response['msg']}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.querySema = function querySema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  Default.querySema(semaKey)
    .then(function (response) {
      let msg={
        "id":response['msg'][0]['data']['id'],
        "expiry":response['msg'][0]['data']['expiry'],
        "remain/maxCapacity": response['msg'][0]['data']['remainCapacity']+"/"+response['msg'][0]['data']['maxCapacity'],
      };
      utils.writeJson(res, {"message":msg}, response['statusCode']);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

