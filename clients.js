const AWS = require('aws-sdk');
const {createClient} = require('redis');

AWS.config.update({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
    maxRetries: 2,
    httpOptions: {
        timeout: 60000, // 60sec.
        connectTimeout: 10000 // 10sec.
    }
});
AWS.config.logger = console;

const sqs = new AWS.SQS();
const ddbDocClient = new AWS.DynamoDB.DocumentClient();
const cache = createClient({url: process.env.REDIS_ENDPOINT});
cache.connect().then(_ => { console.log(`cache connected`)});
const QueueUrl = process.env.QUEUE_URL;
const SmsSendQUrl = process.env.SMS_SEND_Q_URL;

module.exports = {sqs, ddbDocClient, cache, QueueUrl, SmsSendQUrl}
