let AWS=require('aws-sdk');

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});
let dynamodb= new AWS.DynamoDB();
let docClient= new AWS.DynamoDB.DocumentClient();
//<<some exe in the bottom>>//

//=============================================================================


exports.creaTable=function(tableName){
    var params = {
        TableName : tableName,
        KeySchema: [ 
            { AttributeName: 'id', KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: "S" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10, WriteCapacityUnits: 10
        }
    };
    let tb=tableName;
    return new Promise((resolve,reject)=>{
        dynamodb.createTable(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ResourceInUseException'){
                    console.log('#200,table exist,skip...');
                    resolve({'statusCode':200,'msg':'table exist.'});
                }else{
                    console.error("!! CreateTable Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                console.log("#Table Created:",tb);
                resolve({'statusCode':200,'msg':data});
            }
        });
        
    });
}

exports.deleTable=function(tableName){
    var params = {
        TableName : tableName
    };
    let tb=tableName;
    return new Promise((resolve,reject)=>{
        dynamodb.deleteTable(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ResourceNotFoundException'){
                    console.log('#200,table NOT exist,skip...');
                    resolve({'statusCode':200,'msg':'table NOT exist.'});
                }else{
                    console.error("!! DeleteTable Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                console.log("#Table Deleted:",tb);
                resolve({'statusCode':200,'msg':data});
            }
        });
    });
}

exports.creaLoc=function(tb,keyVal,key2Val){
    let params={
        TableName: tb,
        Item:{
            'id': keyVal,
            'data': key2Val,
        },
        ConditionExpression:"attribute_not_exists(#da) OR #da.#ex<:tm",
        ExpressionAttributeNames:{
            "#da":'data',
            "#ex":'expiry',
        },
        ExpressionAttributeValues: {
            ":tm": Date.now(),
        }
    };
    //condition > without key 'data'(conflict)
    return new Promise((resolve,reject)=>{
        docClient.put(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                    console.log('#409,lock conflict or in use.');
                    resolve({'statusCode':409,'msg':'lock conflict/in use or invaild request'});
                }else{
                    console.error("!! CreateLoc Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                //dynamo callback data return {}(empty)
                console.log("#Create Lock succeed.");
                resolve({'statusCode':200,'msg':key2Val});
            }
        });
    });
}

exports.deleLoc=function(tb,idVal,checkHandle){
    let params={
        TableName: tb,
        Key:{ 'id': idVal },
        ConditionExpression:"#da.#ke=:k AND #da.#hd=:h",
        ExpressionAttributeNames:{
            "#ke": 'id',
            "#da":'data',
            "#hd":'handle',
        },
        ExpressionAttributeValues: {
            ":k": idVal,
            ":h": checkHandle,
        }
    };
    //condition > key and handle correctspond
    return new Promise((resolve,reject)=>{
        docClient.delete(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                    console.log('#400,lock not exist or invaild request');
                    resolve({'statusCode':400,'msg':'error or invaild request'});
                }else{
                    console.error("!! DeleteLoc Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                //dynamo callback data return {}(empty)
                console.log("#Delete Lock succeeded.");
                resolve({'statusCode':200,'msg':"delete Lock success"});
            }
        });
    });
}

exports.querLoc=function(tableName,keyValue){
    let params = {
        TableName : tableName,
        KeyConditionExpression: "#k = :vvvv",
        ExpressionAttributeNames:{
            "#k": 'id'
        },
        ExpressionAttributeValues: {
            ":vvvv": keyValue
        }
    };
    return new Promise((resolve,reject)=>{
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("!! QueryLoc Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
            } else {
                console.log("#Query succeeded. Find:",data['Count'],'item');
                if(data['Count']==0 && data['Items']==""){
                    resolve({'statusCode':400,'msg':"lock not exist or invaild request"});
                }else{
                    resolve({'statusCode':200,'msg':data['Items']});
                }
            }
        });
    });
}

exports.updatSemaCount=function(idVal,checkHandle,countOper,ttl){
    let oper=countOper>0 ? true : false;
    if(countOper>1) countOper=1;
    if(countOper<-1) countOper=-1;
    let beat=ttl>0?ttl:3 || 3;
    beat=(beat>10?10:beat)*1000;

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
        docClient.update(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                    if(oper){
                        console.log('#409,out of lock maxCapacity / not been created or invaild request');
                        resolve({'statusCode':409,'msg':'out of lock maxCapacity / lock not been created or invaild request'});
                    }else{
                        console.log('#200,lock released on maxCapacity.');
                        resolve({'statusCode':200,'msg':'lock released on maxCapacity'});
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

exports.heartBeat=function(tableName,idVal,checkHandle,delayTime){
    let delay_time=delayTime>0?delayTime:5 || 5;
    delay_time=(delay_time>10?10:delay_time)*1000;
    let params={
        TableName: tableName,
        Key:{ 'id': idVal},
        UpdateExpression: "set #da.#ep = #da.#ep+:d",
        ConditionExpression: "#da.#ke=:k AND #da.#hd=:h",
        ExpressionAttributeNames:{
            "#da":'data',
            "#ke":'id',
            "#hd":'handle',
            "#ep":"expiry",
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":h":checkHandle,
            ":d":delay_time,
        },
        ReturnValues:"UPDATED_NEW"
    };

    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ConditionalCheckFailedException'){
                    console.log('#400,lock not exist or invaild request');
                    resolve({'statusCode':400,'msg':'error or invaild request'});
                }else{
                    console.error("!! DeleteLoc Error:", err["code"]);
                    resolve({'statusCode':400,'msg':"invaild request"});
                }
            } else {
                console.log("#UpdatSemaTime succeeded.");
                resolve({'statusCode':200,'msg':data['Attributes']['data']});
            }
        });
    });
}


//==================================================================================================

//TEST FOR RESET TABLE
// module.exports.deleTable('MutexTB').then(()=>{
//     return module.exports.deleTable('SemaTB');
// })

//create Table first
module.exports.creaTable('MutexTB').then(()=>{
    return module.exports.creaTable('SemaTB');
})
