'use strict';

let DB=require("./db.js");
const uuidv4 = require('uuid/v4');


//Update ttl
exports.extendSema = function(semaKey,semaHandle,semaphore) {

  DB.quer('test01',semaKey).then((val)=>{
    console.log('## Got Item:',val);
    let exp=val[0]['data']['expiry'] || 0;
    let now=Date.now();
    exp=(now-exp)/1000;
    exp==~~exp;
    semaphore={'ttl':exp};
  });

  return DB.updatItem(semaKey,semaHandle).then((val)=>{
    console.log('## lock extend success');
    return val || 0;
  }).catch((err)=>{
    console.log('%% Catch Error.',err);
    return {'_semaKey':semaKey};
  });

}


//Acquire semaphore(Lock)
exports.lockSema = function(semaKey,semaphore){

  let obj={
    "handle" : uuidv4(),
    "id" : semaKey,
    "expiry" : Date.now(),
    "locked" : true
  };

  let checkSpace =DB.updatCount('main',1).then((res)=>{
    console.log('## adding...');
    return DB.crea('test01',semaKey,obj);//A(promise)
  },(rej)=>{
    console.log('%% out of space...');
    return {'outOfSpace':{'_semaKey':semaKey}};//B
  })

  let checkKeyId =checkSpace.then((ans)=>{
    console.log('## ',ans);
    return ans;//C //ans=B or A(resolve)
  },(rej)=>{
    console.log('%% duplicated key');
    return DB.updatCount('main',-1);//D(promise) //A(reject) key duplicated count-1
  })

  return checkKeyId.then((ans)=>{
    console.log('## finish...');
    if(ans==='updated') return {'duplicatedKey':{'_semaKey':semaKey}} //D(resolve)
    return ans || 0;//C
  },(rej)=>{
    console.log('%% Error on delete duplicated key');
    return {'_semaKey':semaKey};//D(reject)(other reasons)
  }).catch((err)=>{
    //other Error occur
    console.log('%% Catch Error.',err);
    return {'_semaKey':semaKey};
  });
}


//Query semaphore status
exports.querySema = function(semaKey) {
  return DB.quer('test01',semaKey).then((val)=>{
    console.log('## Got Item:',val);
    let v=val[0]['data']['expiry'] || 0;
    return {'expiry':v} || 0;//Unix millisecond
  }).catch((err)=>{
    console.log('%% Catch Error.',err);
    return {'_semaKey':semaKey};
  });
}


//Unlock
exports.unlockSema = function(semaKey,semaHandle) {
  //if delete failed catch error;
  return DB.dele('test01',semaKey,semaHandle).then(()=>{
    console.log('##delete success,update counting ...');
    return DB.updatCount('main',-1);
  }).then(()=>{
    return {'DeleteSuccess':{'key':semaKey,'handle':semaHandle}} || 0;
  }).catch((err)=>{
    console.log('%% Catch Error.',err);
    return {'_DeleteSuccess':semaKey};
  });
}



