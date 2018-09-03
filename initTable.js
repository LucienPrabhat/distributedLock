let AWS=require('aws-sdk');

let version={
  region: "ap-northeast-1",
}
let devVersion={
  region: "us-west-2",
  endpoint: "http://localhost:8000"
}
let configUpdate=devVersion;

let dynamodb= new AWS.DynamoDB(configUpdate);
let docClient= new AWS.DynamoDB.DocumentClient(configUpdate);

// FUNCTIONS
function creaTable(table_Name,params){
    return dynamodb.createTable(params).promise()
            .then(data => console.log("#Table Created:",table_Name) )
            .catch(err =>{
                if(err['statusCode']==400 && err['code']=='ResourceInUseException'){
                    return console.log('#table existed, skip...');
                }
                console.error("!! CreateTable Error:", err["code"]);
            })
}

function deleTable(table_Name){
    let tableName=table_Name;
    let params = {
        TableName : tableName
    };
    return dynamodb.deleteTable(params).promise()
            .then(data => console.log("#Table Deleted:",tableName) )
            .catch(err => {
            if(err['statusCode']==400 && err['code']=='ResourceNotFoundException'){
                return console.log('#200,table NOT exist,skip...');
            }
            console.error("!! DeleteTable Error:", err["code"]);
    })
}


//TEST FOR RESET TABLE
// exports.ResetForTest=function(){
//     deleTable('MutexTB').then(()=>{
//         return deleTable('SemaTB');
//     }).then(()=>{
//         creaTable('MutexTB');
//         creaTable('SemaTB');
//     })
// };

//create Table for INITIAL
let mutexParam = {
    TableName : 'mutexLock',
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
let semaParam = {
    TableName : 'semaphoreLock',
    KeySchema: [ 
        { AttributeName: 'id', KeyType: "HASH"},
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: "S" },
        { AttributeName: 'expiry', AttributeType: "N" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10, WriteCapacityUnits: 10
    },
    GlobalSecondaryIndexes: [
        {
          IndexName: 'secondary',
          KeySchema: [
            { AttributeName: 'id', KeyType: "HASH"},
            { AttributeName: 'expiry', KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "ALL"
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
          }
        },
    ],
};


creaTable('mutexLock',mutexParam)
creaTable('semaphoreLock',semaParam)