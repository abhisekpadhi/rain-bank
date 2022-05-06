const {handleSmsSendingTask} = require("./utils");
const {deleteReadMessage} = require("./utils");

// listens to sms sending tasks and triggers sms
exports.handler = async (event) => {
    Object.freeze(event);
    console.log(`received event: ${JSON.stringify(event)}`)
    // delete messages from sqs
    await deleteReadMessage(event['Records'])
    // process each task
    for (const record of event['Records']) {
        const payload = JSON.parse(record.body);
        const {receiver, content} = payload;
        console.log(`will send sms: ${JSON.stringify(payload)}`);
        await handleSmsSendingTask(receiver, content)
    }

    return {
        statusCode: 200,
        body: JSON.stringify('ok'),
    };
};
