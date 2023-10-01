import messagesModel from '../models/messages.js';

async function createMessage(req, res) {
    // check user ID
    // let user = [get ID];
    // if (!user) { return false }
    if (!req.body.message) {
        res.send("{'status': 'fail'}");
    } else {
        let message = new messagesModel(1, req.body.message, new Date(Date.now()).toISOString());
        await message.persist();
        res.send("{'status': 'success'}");
    }
}

export { createMessage };
