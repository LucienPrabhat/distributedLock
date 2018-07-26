let AWS=require('aws-sdk');

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});
let dynamodb= new AWS.DynamoDB();
let docClient= new AWS.DynamoDB.DocumentClient();

// deleTable('test01_count');
// deleTable('test01');
// deleTable('ttt');

// quer('test01_count','main').then(()=>{
// 	return quer('test01','a09');
// }).then(()=>{
// 	return quer('test01','a10');
// }).then(()=>{
// 	return quer('test01','a11');
// });


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
	return new Promise((resolve,reject)=>{
		dynamodb.createTable(params, function(err, data) {
		    if (err) {
		        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
		        reject(err);
		    } else {
		        console.log("Created table");
		        resolve(data);
		    }
		});
		
	});
}

function deleTable(tableName){
	var params = {
	    TableName : tableName
	};
	return new Promise((resolve,reject)=>{
		dynamodb.deleteTable(params, function(err, data) {
		    if (err) {
		        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
		        reject();
		    } else {
		        console.log("Deleted table.");
		        resolve();
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
	return new Promise((resolve,reject)=>{
		docClient.put(params, function(err, data) {
		    if (err) {
		        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		        reject(err);
		    } else {
		        console.log("Added item:", data);
		        resolve(data);
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
	return new Promise((resolve,reject)=>{
		docClient.delete(params, function(err, data) {
		    if (err) {
		        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
		        reject();
		    } else {
		        console.log("DeleteItem succeeded.");
		        resolve();
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
		        reject();
		    } else {
		        console.log("Query succeeded.",data['Items']);
		        resolve();
		    }
		});
	});
}

function upda(tb,idV,countOper){
	let params={
	    TableName: tb,
	    Key:{ 'id': idV},
	    UpdateExpression: "set #da.#de= :d , #da.#cn = #da.#cn+:c",
	    ConditionExpression: "#da.#cn <= :num",
	    ExpressionAttributeNames:{
        	"#da":'data',
        	"#de":'date',
        	"#cn":'count',
    	},
	    ExpressionAttributeValues:{
	        ":d":Date.now(),
	        ":c":countOper,
	        ":num":10-countOper,
	    },
	    ReturnValues:"UPDATED_NEW"
	};
	return new Promise((resolve,reject)=>{
		docClient.update(params, function(err, data) {
		    if (err) {
		        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
		        reject();
		    } else {
		        console.log("UpdateItem succeeded.",data);
		        resolve();
		    }
		});
	});
}