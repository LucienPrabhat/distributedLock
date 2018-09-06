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
  return DB.querLoc('mutexLock',mutexKey);
}

//SEMAPHORE
//Create semaphore
function createSema(semaKey,semaLockargs) {
  let obj = {
      "id" : semaKey,
      "seatTotal" : semaLockargs.seats,
      "seatVaild" : semaLockargs.seats,
      "seat": {
        "DefaultHandle" : 0,
      }
  };
  return DB.creaLoc('semaphoreLock',obj);
}
//Delete semaphore
function deleteSema(semaKey) {
  return DB.deleLoc('semaphoreLock',semaKey,null);//under reconstruction
}
//Acquire(+1) seat from semaphore
function aquireSeat(semaKey,semaSeatttl) {

  let checkKeyNonexistOrFull = DB.querLoc('semaphoreLock',semaKey).then(data=>{
    console.log('checking key not found or full');
    if(data.statusCode===200) return DB.clearSeat(data.msg)//409,200
    return data;//400,404
  })

  return DB.sitOrLeave(semaKey,1,uuidv4(),Date.now()+(semaSeatttl.ttl*1000))
  .then(data=>{ return data })
  .catch(err=>{
    if(data.statusCode===400) return err; //400
    return checkKeyNonexistOrFull;//401 => 404,409
  });

}
//Release(-1) seat from semaphore
function releaseSeat(semaKey,semaHandle) {
  return DB.sitOrLeave(semaKey,-1,semaHandle.handle,0);
}
//Update seat expiry(ttl)
function postponeSeat(semaKey,semaSeatArgs) {
  return DB.heartBeat('semaphoreLock',semaKey,semaSeatArgs.handle,semaSeatArgs.ttl);
}
//Query semaphore status
function querySema(semaKey) {
  return DB.querLoc('semaphoreLock',semaKey);
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

