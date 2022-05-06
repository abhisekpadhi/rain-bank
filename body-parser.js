const parseBodyForIfttt = (event) => JSON.parse(event.body)

// received sms will be in base64 format, mime type of body is multipart/form-data
const parseBodyForTextLocal = (event) => {
    // convert base64 body to buffer then to utf-8 string
    const buff = new Buffer.from(event.body, 'base64');
    const body = buff.toString('utf-8');
    console.log(`body: ${body}`)

    // determine boundary
    const boundary = event['headers']['content-type'].replace('multipart/form-data; boundary=', '');
    console.log(`boundary: ${boundary}`);

    // split by boundary
    const lines = body.split(boundary)
    console.log(`lines: ${JSON.stringify(lines)}`);
    const splitted = lines[0].split('&');

    // parse data to an object
    const map = {}
    splitted.forEach(o => {
        map[o.split('=')[0]] = decodeURIComponent(o.split('=')[1])
    })

    // check README.md for schema of map - Message body published to sqs
    console.log(map);
    return {sender, content} = map;
}

module.exports = {
    parseBodyForIfttt,
    parseBodyForTextLocal
}
