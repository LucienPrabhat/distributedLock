let db=require("../config/config.js");


function creaLoc(tb,items){

    let param={};
    param.mutexLock = {
        TableName: tb,
        Item: items,
        ConditionExpression:"attribute_not_exists(#ex) OR #ex<:tm",
        ExpressionAttributeNames:{
            "#ex":'expiry',
        },
        ExpressionAttributeValues: {
            ":tm": Date.now(),
        }
    };
    param.semaphoreLock = {
        TableName: tb,
        Item: items,
        ConditionExpression:"attribute_not_exists(#st) AND attribute_not_exists(#sv)",
        ExpressionAttributeNames:{
            "#st":'seatTotal',
            "#sv":'seatVaild',
        }
    };

    return db.docClient.put(param[tb]).promise()
        .then(data=>{
            console.log(`#Create ${tb} succeed.`);
            return {'statusCode':200,'msg':items};
        })
        .catch(err=>{
            if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                console.log(`#409, ${tb} conflict`);
                return {'statusCode':409,'msg':'conflict / lock in use'}
            }
            console.error(`!! Create ${tb} Error:`, err["code"]);
            return {'statusCode':400,'msg':"invaild request"}
        })
}

function deleLoc(tb,idVal,checkHandle){

    let param={};
    param.semaphoreLock = {
        TableName: tb,
        Key: { 'id': idVal },
        ConditionExpression: "#ke=:k AND #sv=#st",
        ExpressionAttributeNames:{
            "#ke": 'id',
            "#st": 'seatTotal',
            "#sv": 'seatVaild',
        },
        ExpressionAttributeValues:{
            ":k": idVal,
        }
    };
    param.mutexLock = {
        TableName: tb,
        Key: { 'id': idVal },
        ConditionExpression: "#ke=:k AND #hd=:h",
        ExpressionAttributeNames:{
            "#ke": 'id',
            "#hd":'handle',
        },
        ExpressionAttributeValues:{
            ":k": idVal,
            ":h": checkHandle,
        }
    };
    let msgHandle={
        "semaphoreLock": "not found or seats is not empty",
        "mutexLock": "not found or incorrect request",
    }

    return db.docClient.delete(param[tb]).promise()
        .then(data=>{
            console.log(`#Delete ${tb} succeeded.`);
            return {'statusCode':200,'msg':`Delete ${tb} success`}
        })
        .catch(err=>{
            if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                console.log(`#401, ${tb} ${msgHandle[tb]}`);
                return {'statusCode':401,'msg':`${tb} ${msgHandle[tb]}`}
            }
            console.error("!! DeleteLoc Error:", err["code"]);
            return {'statusCode':400,'msg':"invaild request"}
        })

}

function querLoc(lockType,keyValue){

    let params = {
        TableName : lockType,
        KeyConditionExpression: "#k = :kv",
        ExpressionAttributeNames:{ "#k": 'id' },
        ExpressionAttributeValues: { ":kv": keyValue }
    };

    return db.docClient.query(params).promise()
    .then(data=>{
        let message= data.Items;
        let count=data.Count;
        console.log(`#Query ${lockType} succeeded. Find: ${count} item`);
        if(count==0 && message=="") return {'statusCode':404,'msg':"lock not found"}
        if(lockType === "mutexLock") delete message[0].handle ;
        return {'statusCode':200,'msg': message[0]}
    })
    .catch(err=>{
        console.error("!! QueryLoc Error:", err);
        return {'statusCode':400,'msg':"invaild request"}
    })

}

function sitOrLeave(idVal,countOper,handle,expiry){

    let option={};
    option.ConditionExpression={
        "-1":"#ke=:k AND #st>#sv AND #sv>=:z AND #s.#hd>:z",
        "1":"#ke=:k AND #st>=#sv AND #sv>:z AND NOT #s.#hd>:z",
    }
    option.UpdateExpression={
        "-1":"set #sv= #sv+:c ,#s.#hd= :e",
        "1":"set #sv= #sv+:c ,#s.#hd= :e",
    }

    let params={
        TableName: 'semaphoreLock',
        Key:{ 'id': idVal },
        UpdateExpression: option.UpdateExpression[countOper] ,
        ConditionExpression: option.ConditionExpression[countOper],
        ExpressionAttributeNames:{
            "#ke":'id',
            "#st":'seatTotal',
            "#sv":'seatVaild',
            "#s":'seat',
            "#hd":handle,
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":c":-countOper,
            ":z":0,
            ":e":expiry,
        },
        ReturnValues:"UPDATED_NEW"
    };

    let msgHandle={
        '-1':'Release',
        '1':'Aquire',
    }
    let resErrorHandle={
        '-1':'key or handle not exist',
        '1':'key not found or seat has reached the maximun',
    }

    return db.docClient.update(params).promise()
    .then(data=>{
        console.log(`#${msgHandle[countOper]} seat succeeded.`);
            return {'statusCode':200,'msg':data['Attributes']}
    }).catch(err=>{
        if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
            console.log(`#401, ${resErrorHandle[countOper]}`);
            return {'statusCode':401,'msg':resErrorHandle[countOper]};
        }
        console.error("!! UpdatSemaCount Error:", err);
        return {'statusCode':400,'msg':"invaild request"}
    })

}

function clearSeat(semaphoreData,handle,expiry){
    let obj=semaphoreData;
    let expireCount =0;

    for(let key in obj.seat){
        let exp= obj.seat[key];
        if(exp < Date.now()){
            console.log(`Clear expire key: ${key} on ${exp}`)
            delete obj.seat[key]
            if(exp!=0) expireCount++
        }
    }
    if(expireCount==0){
        console.log(`#409,seat has reached the maximun`);
        return {'statusCode':409,'msg':'seat has reached the maximun'}
    }
    obj.seat[handle]=expiry;
    return _aquireOnce(obj,expireCount);

}

function _aquireOnce(obj,expireCount){
    let params={
        TableName: 'semaphoreLock',
        Key:{ 'id': obj.id },
        UpdateExpression: "set #sv=#sv+:c ,#st=:s" ,
        ConditionExpression: "#ke=:k",
        ExpressionAttributeNames:{
            "#ke":'id',
            "#sv":'seatVaild',
            "#st":'seat',
        },
        ExpressionAttributeValues:{
            ":k":obj.id,
            ":c":expireCount-1,
            ":s":obj.seat,
        },
        ReturnValues:"UPDATED_NEW"
    };

    return db.docClient.update(params).promise()
    .then(data=>{
        console.log(`#Aquire seat succeeded.`);
            return {'statusCode':200,'msg':data['Attributes']}
    }).catch(err=>{
        console.error("!! UpdatSemaCount Error:", err['code']);
        return {'statusCode':400,'msg':"invaild request"}
    })
}

function heartBeat(tableName,idVal,handle,ttl){

    let params={};
    params.semaphoreLock={
        TableName: tableName,
        Key: { 'id': idVal },
        UpdateExpression: "set #st.#hd = #st.#hd+:d",
        ConditionExpression: "#ke=:k AND #st.#hd>:z",
        ExpressionAttributeNames:{
            "#ke":'id',
            "#hd":handle,
            "#st":"seat",
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":d":ttl*1000,
            ":z":0,
        },
        ReturnValues:"UPDATED_NEW"
    };
    params.mutexLock={
        TableName: tableName,
        Key: { 'id': idVal },
        UpdateExpression: "set #ep = #ep+:d",
        ConditionExpression: "#ke=:k AND #hd=:h",
        ExpressionAttributeNames:{
            "#ke":'id',
            "#hd":'handle',
            "#ep":"expiry",
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":h":handle,
            ":d":ttl*1000,
        },
        ReturnValues:"UPDATED_NEW"
    };

    return db.docClient.update(params[tableName]).promise()
    .then(data=>{
        console.log(`# ${tableName} extend ttl succeeded.`);
        return {'statusCode':200,'msg':data['Attributes']}
    })
    .catch(err=>{
        if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
            console.log(`#401,${tableName} not exist or invaild request`);
            return {'statusCode':401,'msg':'error or invaild request'}
        }else{
            console.error(`!! Extend ${tableName} Error:`, err["code"]);
            return {'statusCode':400,'msg':"invaild request"}
        }
    })

}


module.exports={
    creaLoc,
    deleLoc,
    querLoc,
    sitOrLeave,
    clearSeat,
    heartBeat,
}