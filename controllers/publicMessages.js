import messagesModel from '../models/messages.js';

async function createPublicMessage(req, res) {
    // check user ID
    // let user = [get ID];
    // if (!user) { return false }
    let user_id = 1;
    if (!req.body.message) {
        return res.status(400).json("{'status': 'No messages provided'}");
    } else {
        // Receiver Id 0 is for public chat
        let message = new messagesModel(user_id, 0, req.body.message, new Date(Date.now()).toISOString());
        await message.persist();
        return res.status(201).json("{'status': 'success'}");
    }
}

export { createPublicMessage };
