let AWS=require('aws-sdk');

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});
let dynamodb= new AWS.DynamoDB();
let docClient= new AWS.DynamoDB.DocumentClient();

//=============================================================================

deleTable('test01');
deleTable('test01_count');

// deleTable('MutexTB').then(()=>{
// 	console.log(1);
// 	return deleTable('SemaTB');
// }).then(()=>{
// 	console.log(2);
// 	return creaTable('MutexTB');
// }).then(()=>{
// 	console.log(3);
// 	return creaTable('SemaTB');
// }).then(()=>{
// 	console.log(4);
// 	return creaTable('MutexTB');
// }).then(()=>{
// 	console.log(5);
// 	return creaTable('SemaTB');
// })

semaObj = {
      "id" : "sema",
      "handle" : "1234",
      "countInuse" : 0,
      "remainCapacity" : 10,
      "maxCapacity" : 10,
      "expiry" : Date.now(),
    };
mutexObj = {
      "id" : "mu",
      "handle" : "5678",
      "expiry" : Date.now(),
      "locked" : true
    };

//crea()
// deleTable('ttt');

// quer('test01_count','main').then(()=>{
// 	return quer('test01','a09');
// }).then(()=>{
// 	return quer('test01','a10');
// }).then(()=>{
// 	return quer('test01','a11');
// });

//=============================================================================


function creaTable(tableName){
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
                	console.log('table exist,skip...');
                    resolve('table exist');
                }else{
                    console.error("Unable to create table. Error JSON:", err);
                    reject(err);
                }
            } else {
                console.log("Table Created:",tb);
                resolve(data);
            }
        });
        
    });
}

function deleTable(tableName){
    var params = {
        TableName : tableName
    };
    let tb=tableName;
    return new Promise((resolve,reject)=>{
        dynamodb.deleteTable(params, function(err, data) {
            if (err) {
                if(err['statusCode']==400 && err['code']=='ResourceNotFoundException'){
                	console.log('table NOT exist,skip...');
                    resolve('table NOT exist');
                }else{
                    console.error("Unable to create table. Error JSON:", err);
                    reject(err);
                }
            } else {
                console.log("Table Deleted:",tb);
                resolve(data);
            }
        });
    });
}

function crea(tb,keyVal,key2Val){
    let params={
        TableName: tb,
        Item:{
            'id': keyVal,
            'data': key2Val,
        },
        ConditionExpression:"attribute_not_exists(#da)",
        ExpressionAttributeNames:{
            "#da":'data',
        }
    };
    //condition > without key 'data'(conflict)
    return new Promise((resolve,reject)=>{
        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Added item:", data);
                resolve(key2Val);
            }
        });
    });
}

function dele(tb,idVal,checkHandle){
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
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("DeleteItem succeeded.");
                resolve(data);
            }
        });
    });
}

function quer(tableName,keyValue){
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
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Query succeeded.",data['Items']);
                resolve(data['Items']);
            }
        });
    });
}

function updatSemaCount(idVal,checkHandle,countOper){
    let params={
        TableName: 'SemaTB',
        Key:{ 'id': idVal},
        UpdateExpression: "set #da.#ex= :d , #da.#cn = #da.#cn+:c , #da.#rc = #da.#rc-:c" ,
        ConditionExpression: "#da.#mc <= :num AND #da.#ke=:k AND #da.#hd=:h",
        ExpressionAttributeNames:{
            "#da":'data',
            "#ke":'id',
            "#hd":'handle',
            "#ex":'expiry',
            "#cn":'countInuse',
            "#rc":'remainCapacity',
            "#mc":'maxCapacity',
        },
        ExpressionAttributeValues:{
            ":k":idVal,
            ":h":checkHandle,
            ":d":Date.now()+3000,
            ":c":countOper,
            ":num":"#da.#mc"-countOper,
        },
        ReturnValues:"UPDATED_NEW"
    };
    //condition > less than maxCapacity
    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded.",data);
                resolve(data['Attributes']['data']);
            }
        });
    });
}

function updatSemaTime(idVal,checkHandle,delayTime){
    let delay_time=(delayTime>10?10:delayTime) || 5;
    delay_time*=1000;
    let params={
        TableName: "SemaTB",
        Key:{ 'id': idVal},
        UpdateExpression: "set #da.#ep= :d",
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
            ":d":Date.now()+delay_time,
        },
        ReturnValues:"UPDATED_NEW"
    };
    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded.",data);
                resolve(data['Attributes']['data']);
            }
        });
    });
}

function updatMutexTime(idVal,checkHandle,delayTime){
    let delay_time=(delayTime>10?10:delayTime) || 5;
    delay_time*=1000;
    let params={
        TableName: "MutexTB",
        Key:{ 'id': idVal},
        UpdateExpression: "set #da.#ep= :d",
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
            ":d":Date.now()+delay_time,
        },
        ReturnValues:"UPDATED_NEW"
    };
    return new Promise((resolve,reject)=>{
        docClient.update(params, function(err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded.",data);
                resolve(data['Attributes']['data']);
            }
        });
    });
}
