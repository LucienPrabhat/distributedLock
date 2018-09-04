let db=require("../config/config.js");


exports.creaLoc=function(tb,items){

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
        ConditionExpression:"attribute_not_exists(#hd) AND attribute_not_exists(#st) AND attribute_not_exists(#sv)",
        ExpressionAttributeNames:{
            "#st":'seatTotal',
            "#sv":'seatVaild',
            "#hd":'handle',
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

exports.deleLoc=function(tb,idVal,checkHandle){

    let keyType={};
    keyType.semaphoreLock= { 'id': idVal, 'handle': checkHandle };
    keyType.mutexLock= { 'id': idVal };

    let param = {
        TableName: tb,
        Key: keyType[tb],
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

    let msgHandle={};
    msgHandle.semaphoreLock="Release seat from";
    msgHandle.mutexLock="Delete";

    return db.docClient.delete(param).promise()
        .then(data=>{
            console.log(`#${msgHandle[tb]} ${tb} succeeded.`);
            return {'statusCode':200,'msg':`${msgHandle[tb]} ${tb} success`}
        })
        .catch(err=>{
            if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                console.log(`#401, ${tb} not found or incorrect request`);
                return {'statusCode':401,'msg':`${tb} not found or incorrect request`}
            }
            console.error("!! DeleteLoc Error:", err["code"]);
            return {'statusCode':400,'msg':"invaild request"}
        })

}

exports.querLoc=function(lockType,tableName,keyValue){

    let params = {
        TableName : tableName,
        KeyConditionExpression: "#k = :kv",
        ExpressionAttributeNames:{ "#k": 'id' },
        ExpressionAttributeValues: { ":kv": keyValue }
    };

    return db.docClient.query(params).promise()
    .then(data=>{
        console.log(`#Query ${lockType} succeeded. Find: ${data['Count']} item`);
        if(data['Count']==0 && data['Items']==""){
            return {'statusCode':404,'msg':"lock not found"}
        }

        let message= data.Items[0];
        if(lockType === "mutex") delete message.handle ;
        return {'statusCode':200,'msg': message}
    })
    .catch(err=>{
        console.error("!! QueryLoc Error:", err);
        return {'statusCode':400,'msg':"invaild request"}
    })

}

exports.updatSemaCount=function(idVal,checkHandle,countOper,ttl){
    let oper=countOper>0 ? true : false;
    if(countOper>1) countOper=1;
    if(countOper<-1) countOper=-1;

    let beat=(ttl>0 && ttl<=60 ) ? ttl : 60;
    beat*=1000;

    //condition > add/release 1 each time , remain/count<max
    let params={
        TableName: 'SemaTB',
        Key:{ 'id': idVal},
        UpdateExpression: "set #da.#ex= #da.#ex+:d , #da.#cn = #da.#cn+:c , #da.#rc = #da.#rc-:c" ,
        ConditionExpression: "#da.#cn>=:z AND #da.#rc >= :c AND #da.#ke=:k AND #da.#hd=:h",
        ExpressionAttributeNames:{
            "#da":'data',
            "#ke":'id',
            "#hd":'handle',
            "#ex":'expiry',
            "#cn":'countInuse',
            "#rc":'remainCapacity',
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":h":checkHandle,
            ":d":beat,
            ":c":countOper,
            ":z":-countOper,
        },
        ReturnValues:"UPDATED_NEW"
    };

    return new Promise((resolve,reject)=>{
        db.docClient.update(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                    if(oper){
                        console.log('#409,out of lock maxCapacity / not been created or invaild request / or Wrong handle');
                        resolve({'statusCode':409,'msg':'out of lock maxCapacity / lock not been created or invaild request / or Wrong handle'});
                    }else{
                        console.log('#409,lock released on maxCapacity / or Wrong handle');
                        resolve({'statusCode':409,'msg':'lock released on maxCapacity or Wrong handle'});
                    }
                }else{
                    console.error("!! UpdatSemaCount Error:", err['code']);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                console.log("#UpdatSemaCount succeeded.");
                resolve({'statusCode':200,'msg':data['Attributes']['data']});
            }
        });
    });
}

exports.heartBeat=function(tableName,idVal,handle,ttl){

    let keyType={};
    keyType.semaphoreLock= { 'id': idVal, 'handle': handle };
    keyType.mutexLock= { 'id': idVal };
    let params={
        TableName: tableName,
        Key: keyType[tableName],
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

    return db.docClient.update(params).promise()
    .then(data=>{
        console.log(`# ${tableName} extend ttl succeeded.`);
        return {'statusCode':200,'msg':data['Attributes']}
    })
    .catch(err=>{
        if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
            console.log('#400,lock not exist or invaild request');
            return {'statusCode':400,'msg':'error or invaild request'}
        }else{
            console.error(`!! Extend ${tableName} Error:`, err["code"]);
            return {'statusCode':400,'msg':"invaild request"}
        }
    })

}

