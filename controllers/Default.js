'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.extendSema = function extendSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  var semaphore = req.swagger.params['semaphore'].value;
  Default.extendSema(semaKey,semaHandle,semaphore)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.lockSema = function lockSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaphore = req.swagger.params['semaphore'].value;
  Default.lockSema(semaKey,semaphore)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.querySema = function querySema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  Default.querySema(semaKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.unlockSema = function unlockSema (req, res, next) {
  var semaKey = req.swagger.params['semaKey'].value;
  var semaHandle = req.swagger.params['semaHandle'].value;
  Default.unlockSema(semaKey,semaHandle)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
