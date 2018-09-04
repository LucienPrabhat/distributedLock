let DB=require("./db.js");
const uuidv4 = require('uuid/v4');

//MUTEX
//Acquire a Mutex
function lockMutex(mutexKey,mutexttl) {
  let obj = {
      "id" : mutexKey,
      "handle" : uuidv4(),
      "expiry" : Date.now()+(mutexttl.ttl*1000),
  };
  return DB.creaLoc('mutexLock',obj);
}
//Delete a Mutex(Unlock)
function unlockMutex(mutexKey,mutexHandle) {
  return DB.deleLoc('mutexLock',mutexKey,mutexHandle.handle);
}
//Update mutex expiry(ttl)
function extendMutex(mutexKey,mutexArg) {
  return DB.heartBeat('mutexLock',mutexKey,mutexArg.handle,mutexArg.ttl);
}
//Query mutex status
function queryMutex(mutexKey) {
  return DB.querLoc('mutex','mutexLock',mutexKey);
}

//SEMAPHORE
//Create semaphore
function createSema(semaKey,semaLockargs) {
  let obj = {
      "id" : semaKey,
      "handle" : "DEFAULT",
      "seatTotal" : semaLockargs.seats,
      "seatVaild" : semaLockargs.seats,
  };
  return DB.creaLoc('semaphoreLock',obj);
}
//Delete semaphore
function deleteSema(semaKey) {
  return DB.deleLoc('semaphoreLock',semaKey,null);//under reconstruction
}
//Acquire(+1) seat from semaphore
function aquireSeat(semaKey,semaSeatttl) {
  return DB.updatSemaCount(semaKey,uuidv4(),1,semaSeatttl.ttl);//under reconstruction
}
//Release(-1) seat from semaphore
function releaseSeat(semaKey,semaHandle) {
  return DB.deleLoc('semaphoreLock',semaKey,semaHandle.handle);
}
//Update seat expiry(ttl)
function postponeSeat(semaKey,semaSeatArgs) {
  return DB.heartBeat('semaphoreLock',semaKey,semaSeatArgs.handle,semaSeatArgs.ttl);
}
//Query semaphore status
function querySema(semaKey) {
  return DB.querLoc('semaphore','semaphoreLock',semaKey);
}

module.exports = {
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

