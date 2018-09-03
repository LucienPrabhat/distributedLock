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

module.exports = {
    dynamodb,
    docClient
}