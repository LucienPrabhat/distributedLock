let aws=require("./config/config.js");


// FUNCTIONS
function createTable(table_Name){

    let param = {
        TableName : table_Name,
        KeySchema: [ 
            { AttributeName: 'id', KeyType: "HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10, WriteCapacityUnits: 10
        },
    };

    return aws.dynamodb.createTable(param).promise()
            .then(data => console.log("#Table Created:",table_Name) )
            .catch(err =>{
                if(err['statusCode']==400 && err['code']=='ResourceInUseException'){
                    return console.log(`#${table_Name} table existed, skip...`);
                }
                console.error("!! CreateTable Error:", err["code"]);
            })
}

function deleTable(table_Name){
    let params = { TableName : table_Name };
    return aws.dynamodb.deleteTable(params).promise()
            .then(data => console.log("#Table Deleted:",table_Name) )
            .catch(err => {
            if(err['statusCode']==400 && err['code']=='ResourceNotFoundException'){
                return console.log('#200,table NOT exist,skip...');
            }
            console.error("!! DeleteTable Error:", err["code"]);
    })
}

function ResetInitTable(){
    console.log('# Resting tables(dev mode) ...')
    deleTable('mutexLock')
    .then(()=>{ return deleTable('semaphoreLock') })
    .then(()=>{
        createTable('mutexLock');
        createTable('semaphoreLock');
    })
};

//create Table for INITIAL
console.log('# initial tables ...')
if(process.env.NODE_ENV=="dev") ResetInitTable()
else{
    createTable('mutexLock');
    createTable('semaphoreLock');
}


module.exports = {
    ResetInitTable
}