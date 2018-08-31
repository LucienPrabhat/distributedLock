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
exports.createSema = function(semaKey,semaLockargs) {
  let obj = {
      "id" : semaKey,
      "seatTotal" : semaLockargs.seats,
      "seatVaild" : semaLockargs.seats,
  };
  return DB.creaLoc('SemaTB',semaKey,obj);
}

//Delete semaphore
exports.deleteSema = function(semaKey) {
  return DB.deleLoc('SemaTB',semaKey,semaHandle);//under reconstruction
}

//Acquire(+1) seat from semaphore
exports.aquireSeat = function(semaKey,semaSeatttl) {
  return DB.updatSemaCount(semaKey,uuidv4(),1,semaSeatttl.ttl);//under reconstruction
}

//Release(-1) seat from semaphore
exports.releaseSeat = function(semaKey,semaHandle) {
  return DB.updatSemaCount(semaKey,semaHandle.handle,-1,0);//under reconstruction
}

//Update seat expiry(ttl)
exports.postponeSeat = function(semaKey,semaSeatArgs) {
  return DB.heartBeat('SemaTB',semaKey,semaSeatArgs.handle,semaSeatArgs.ttl);//under reconstruction
}

//Query semaphore status
exports.querySema = function(semaKey) {
  return DB.querLoc('SemaTB',semaKey);
}

