'use strict';

let DB=require("./db.js");
const uuidv4 = require('uuid/v4');


//MUTEX

//Acquire a Mutex
exports.lockMutex = function(mutexKey,mutexttl) {
  let obj = {
      "id" : mutexKey,
      "handle" : uuidv4(),
      "expiry" : Date.now()+(mutexttl.ttl*1000),
  };
  return DB.creaLoc('MutexTB',mutexKey,obj);
}

//Delete a Mutex(Unlock)
exports.unlockMutex = function(mutexKey,mutexHandle) {
  return DB.deleLoc('MutexTB',mutexKey,mutexHandle.handle);
}

//Update mutex expiry(ttl)
exports.extendMutex = function(mutexKey,mutexArg) {
  return DB.heartBeat('MutexTB',mutexKey,mutexArg.handle,mutexArg.ttl);
}

//Query mutex status
exports.queryMutex = function(mutexKey) {
  return DB.querLoc('MutexTB',mutexKey);
}


//SEMAPHORE

//Create semaphore
exports.createSema = function(semaKey,semaArgs) {
  let ttl=(semaArgs['ttl']>0 && semaArgs['ttl']<=3600)? semaArgs['ttl'] : 60;
  let maxCapacity=semaArgs['maxCapacity']>0 ? semaArgs['maxCapacity'] : 15;
  let obj = {
      "id" : semaKey,
      "handle" : uuidv4(),
      "countInuse" : 0,
      "remainCapacity" : maxCapacity,
      "maxCapacity" : maxCapacity,
      "expiry" : Date.now()+(ttl*1000),
  };
  return DB.creaLoc('SemaTB',semaKey,obj);
}

//Delete semaphore
exports.deleteSema = function(semaKey,semaHandle) {
  return DB.deleLoc('SemaTB',semaKey,semaHandle);
}

//Acquire(+1) space from semaphore
exports.lockSema = function(semaKey,semaHandle,semattl) {
  return DB.updatSemaCount(semaKey,semaHandle,1,semattl['ttl']);
}

//Release(-1) space from semaphore
exports.releaseSema = function(semaKey,semaHandle) {
  return DB.updatSemaCount(semaKey,semaHandle,-1,0);
}

//Update semaphore expiry(ttl)
exports.extendSema = function(semaKey,semaHandle,semattl) {
  return DB.heartBeat('SemaTB',semaKey,semaHandle,semattl['ttl']);
}

//Query semaphore status
exports.querySema = function(semaKey) {
  return DB.querLoc('SemaTB',semaKey);
}

