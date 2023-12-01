import ResponseModel from '../models/response.js';

let ioInstance = null;

function initIOInstanceForResponse(io) {
    ioInstance = io;
}

async function respondCurrentLocation(req, res) {
    const userId = req.user.id;
    const sender_name = req.user.username;
    const location_id = req.body.location_id;
    const message = req.body.message;
    const time = new Date(Date.now()).toLocaleString();
    const response = new ResponseModel({
        sender_id: userId,
        location_id,
        message,
        time,
    });
    await response.persist();
    try {
        ioInstance.emit('response shared', {
            userId,
            sender_name,
            message,
            time,
            location_id,
        });
    } catch (error) {
        console.error('Error responding to location:', error);
    }
}

async function getLocationResponse(req, res) {
    const locationId = req.params.locationId;

    try {
        const responses = await ResponseModel.getLocationResponse(locationId);

    } catch (error) {
        console.error('Error fetching location responses:', error);

    }
}

export {
    initIOInstanceForResponse,
    respondCurrentLocation,
    getLocationResponse
};