# rainbow-fintech
An offline & mobile first neo-bank for underserved population.

## Tech
- Backend: NodeJS
- IAAS:
    1. Db: `AWS Dynamo`
    2. Compute: `AWS Lambda`
    3. Gateway: `AWS API Gateway`
    4. Cache: `AWS Elasticache`
    5. Broker: `AWS SQS`
- CPAAS:
  - `Expensive`, `difficult`, `scalable` (evaluated, but not used in this project):
    - Receiving:
      - [textlocal](https://textlocal.in) +919220592205 `NLLG7` (prefix)
      - [ifttt (sms → webhook)](https://ifttt.com/android_messages)
    - Sending:
      - [twilio](https://twilio.com)
      - [gupshup](https://enterprise.smsgupshup.com)
  - `Inexpensive`, `easy`, `very small scale` (used in this project):
    - Android phone connected to internet, is installed with 2 specific apps, [IFTTT](https://ifttt.com/android_device) & [Pushbullet](https://www.pushbullet.com/)
    - Users send sms to this phone, an ifttt recipe triggers on incoming sms containing a keyword
    - Trigger reads sms content and POST's to Webhook which is hosted in AWS
    - Webhook processes the sms content & calls pushbullet api to send sms via same android phone
    - Inexpensive, since only sms sending charge as per carrier tariff
    - No need to dealing with CPAAS service providers
    - Caveats:
      - Android phone must be online all the time with IFTTT and Pushbullet running in the background
  
## Db schema
- table: `userAccountIdMapping`
```
phone (pk)
id
```

- table: `userAccount`
```
id (pk)
name
phone
loc
pan
verification
balance
currentActive
createdAt
 ```

- table: `userTxn`
```
txnId (pk)
firstParty
secondParty
requestType
money
status
createdAt
currentActive
```

- table: `floatingCashRequest`
indicates latest ask for floating cash request id
```
phone(pk)
id
```

- table: `userRequest`
```
id (pk)
phone
requestType
where
money
otherAccount
status
extraInfo
currentActive
createdAt
```

- table: `userAccountLedger`
```
id (pk)
phone
op
note
money
openingBalance
createdAt
```

- table `userBucket`
```
phoneWithBucketName (pk)
balance
```

- enums

```javascript
const requestType = {
  register: 'register',
  collect: 'collect',
  pay: 'pay',
  transfer: 'transfer',
  seeSaved: 'seeSaved',
  sip: 'sip',
  bucket: 'bucket',
  findDeposit: 'findDeposit',
  findWithdraw: 'findWithdraw'
}

const txnStatus = {
  created: 'created',
  success: 'success',
  failed: 'failed',
}

const op = {
    debit: 'debit',
    credit: 'credit'
}
```

## event schema
- Message received from SQS
```json
{
    "Records": [
        {
            "messageId": "315f83aa-e7f5-4cab-ab7a-08ebed382643",
            "receiptHandle": "AQEB9RDP/7wzhKAyAvKcPsj4ZIiP0lT2v7rUEHS3NdY9NUcl3c/MYrUxx/A+G95BCMxSbbvQlHr5/aqREd2fR7jlAljH+Tco+9yJpWD5m+2zlJL5eZ0lthD/Iu2fXTS7CoibGe9OXygVjtpprk5Rw6npGDSLm2g7XFnH9WQUS7Ff1arQF3QlAu300XTv8nvJVEn7ME2eUrp/y1lIQYQUamULE2tj1gEoC2aXKJx6D/nlV0UR3a9LxFgWQ43AGenzKjWCWw+XwT7aaqys1Rl93NlQeEx+uHOfTdCBjlb8+Ef7Xb0=",
            "body": "{\"sender\":\"919439831236\",\"content\":\"NLLG7 FIND WITHDRAW 1250 DELHI\",\"inNumber\":\"919220592205\",\"submit\":\"Submit\",\"network\":\"\",\"email\":\"none\",\"keyword\":\"NLLG7\",\"comments\":\"FIND WITHDRAW 1250 DELHI\",\"credits\":\"10\",\"msgId\":\"8831460984\",\"rcvd\":\"2022-04-26 17:27:08\",\"firstname\":\"\",\"lastname\":\"\",\"custom1\":\"\",\"custom2\":\"\",\"custom3\":\"\"}",
            "attributes": {
                "ApproximateReceiveCount": "1",
                "SentTimestamp": "1650974230025",
                "SequenceNumber": "18869393476595952384",
                "MessageGroupId": "Group1",
                "SenderId": "AIDAXYDVU3NFEQC345T7T",
                "MessageDeduplicationId": "3df828ca-1c61-40ef-aa43-f09343c13b3b",
                "ApproximateFirstReceiveTimestamp": "1650974232040"
            },
            "messageAttributes": {},
            "md5OfBody": "d4cb092b27df4d5c194720c09f47e11c",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:ap-south-1:532822678346:smsReceivedQ.fifo",
            "awsRegion": "ap-south-1"
        }
    ]
}
```

- Message body published to sqs 
  
*original payload parsed from textlocal*
```json
{
        "sender": "919439831236",
        "content": "NLLG7 TRANSFER 3000 9876543210",
        "inNumber": "919220592205",
        "submit": "Submit",
        "network": "",
        "email": "none",
        "keyword": "NLLG7",
        "comments": "TRANSFER 3000 9876543210",
        "credits": "10",
        "msgId": "8831346667",
        "rcvd": "2022-04-26 16:25:34",
        "firstname": "",
        "lastname": "",
        "custom1": "",
        "custom2": "",
        "custom3": ""
    }
```

**Note:** payload actually sent to sqs
```json
{ 
  "sender": "919439831236", 
  "content": "rain balance"
}
```

## Docs
- [Dynamodb document client](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html)
- Setup awscli for deploy script `deploy.sh`:
```
python3 -m venv .venv
.venv/bin/pip install awscli
```
- To build & deploy:

sink (receive incoming sms)
```shell
./deploy.sh sink
```

worker (process sms)
```shell
./deploy.sh worker
```

- To build lambda layer

1. create directory structure:
```shell
mkdir -p aws-sdk-layer/nodejs
cd aws-sdk-layer/nodejs
```

2. Use amazon linux 2 compatible environment to install required packages:
```shell
docker run --entrypoint "" -v "$PWD":/var/task "public.ecr.aws/lambda/nodejs:14" /bin/sh -c "npm install aws-sdk redis node-fetch@2.6.7; exit"
```

3. zip it
```shell
zip -r ../package.zip ../
```

4. create layer
```shell
Name: <anything>
Upload zip
Runtimes: Node.js 14.x
```

5. Use the layer in lambda function.
This prevents bundling `node_modules` with zip that is deployed to lambda. Reduces the lambda zip package size and prevents version conflicts with lambda preinstalled packages.

---
**Note:** If `elasticache` is in private subnet
- Lambda function needs to be inside vpc and must be associated with privates subnets same as `elasticache`
- AWS VPC endpoints needs to be setup for - `SQS` & `DynamoDB`, since requests for these services travels through internet
- Environment variables (Key: Value), needs to be set for lambda functions:
```shell
ACCESS_KEY_ID:	---
QUEUE_URL:	https://---.fifo
REDIS_ENDPOINT:	redis://---.aps1.cache.amazonaws.com:6379
REGION:	ap-south-1
SECRET_ACCESS_KEY:	---
```
- Modify config: timeout to 30seconds at least, Memory to 256mb
- Add follwing policies to the role (not ideal setup, just a shotgun approach):
```shell
AWSLambdaBasicExecutionRole-64...ef	(already exist, add the remaining 👇)
AmazonSQSFullAccess
AmazonElastiCacheFullAccess
AmazonDynamoDBFullAccess
AWSLambdaDynamoDBExecutionRole
AdministratorAccess
AWSLambdaSQSQueueExecutionRole
AWSLambdaInvocation-DynamoDB
AWSLambdaVPCAccessExecutionRole
```
---

Tests checklist (manual)
---
- [x] Register new account
- [x] Collect cash by agent from customer
- [x] ATM Deposit
- [x] ATM Withdraw
- [x] Pay vendor
- [x] Transfer money
- [x] Create & update bucket
- [x] See account balance
- [x] See bucket balance
- [ ] Find ATM for deposit
- [ ] Find ATM for withdrawal
