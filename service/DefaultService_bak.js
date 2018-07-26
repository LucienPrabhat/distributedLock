'use strict';

let AWS=require('aws-sdk');



//Update ttl
exports.extendSema = function(semaKey,semaHandle,semaphore) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "handle" : "handle",
      "id" : "id",
      "expiry" : 0,
      "locked" : false
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


//Acquire semaphore
exports.lockSema = function(semaKey,semaphore) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "handle" : "handle",
      "id" : "id",
      "expiry" : 0,
      "locked" : false
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


//Query semaphore status
exports.querySema = function(semaKey) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "handle" : "handle",
  "id" : "id",
  "expiry" : 0,
  "locked" : false
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


//Unlock
exports.unlockSema = function(semaKey,semaHandle) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "handle" : "handle",
      "id" : "id",
      "expiry" : 0,
      "locked" : false
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

