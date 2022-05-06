const { publishMessage } = require("./utils.js");
const {
    parseBodyForIfttt
} = require('./body-parser');


exports.handler = async (event) => {
    Object.freeze(event);
    console.log(`received event: ${JSON.stringify(event)}`)
    const map = parseBodyForIfttt(event);
    console.log(map); // check README.md for schema of map
    await publishMessage(JSON.stringify(map)) // publish messaged into sqs
    return {
        statusCode: 200,
        body: JSON.stringify('ok'),
    };
};
