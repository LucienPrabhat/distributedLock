let aws=require("./config/config.js");

//PARAMS
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
        { AttributeName: 'handle', KeyType: "RANGE"},
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: "S" },
        { AttributeName: 'handle', AttributeType: "S"},
        { AttributeName: 'expiry', AttributeType: "N" },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10, WriteCapacityUnits: 10
    },
    LocalSecondaryIndexes: [
        {
          IndexName: 'secondary',
          KeySchema: [ 
            { AttributeName: 'id', KeyType: "HASH" },
            { AttributeName: 'expiry', KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "ALL",
          }
        },
    ],
};

// FUNCTIONS
function createTable(table_Name,params){
    return aws.dynamodb.createTable(params).promise()
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
    return aws.dynamodb.deleteTable(params).promise()
            .then(data => console.log("#Table Deleted:",tableName) )
            .catch(err => {
            if(err['statusCode']==400 && err['code']=='ResourceNotFoundException'){
                return console.log('#200,table NOT exist,skip...');
            }
            console.error("!! DeleteTable Error:", err["code"]);
    })
}

function ResetInitTable(){
    deleTable('mutexLock')
    .then(()=>{ return deleTable('semaphoreLock') })
    .then(()=>{
        createTable('mutexLock',mutexParam);
        createTable('semaphoreLock',semaParam);
    })
};

//create Table for INITIAL
createTable('mutexLock',mutexParam);
createTable('semaphoreLock',semaParam)

module.exports = {
    ResetInitTable
}