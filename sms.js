const { randomUUID } = require('crypto');
const fetch = require('node-fetch');

async function pushbulletSendSms(body, to) {
    const url = 'https://api.pushbullet.com/v2/texts';
    const headers = {'Access-Token': process.env.PUSHBULLET_ACCESS_TOKEN, 'Content-Type': 'application/json'};
    const payload = {
        "data": {
            "addresses": [to],
            "message": body,
            "target_device_iden": process.env.PUSHBULLET_TARGET_DEVICE_IDEN,
            "guid": randomUUID(),
        }
    }
    const params = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
    }
    const resp = await fetch(url, params);
    const result = await resp.json();
    console.log(`pushbullet sms result: ${JSON.stringify(result)}`);
}

module.exports = {
    pushbulletSendSms
}
