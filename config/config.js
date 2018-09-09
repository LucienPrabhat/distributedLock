let AWS=require('aws-sdk');

var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./config/enviroment.json', 'utf8'));

const enviroment= process.env.NODE_ENV || "production"

const config = {
  'dev': obj.dev,
  'production': {
      endpoint: obj.production.endpoint,
      region: obj.production.region,
      credentials: new AWS.Credentials({
          accessKeyId: obj.production.accessKeyId,
          secretAccessKey: obj.production.secretAccessKey
      })
  }
}

let dynamodb= new AWS.DynamoDB(config[enviroment]);
let docClient= new AWS.DynamoDB.DocumentClient(config[enviroment]);

module.exports = {
    dynamodb,
    docClient
}