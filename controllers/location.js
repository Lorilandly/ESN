import LocationModel from '../models/location.js';

let ioInstance = null;

function initIOInstanceForLocation(io) {
    ioInstance = io;
}

async function shareCurrentLocation(req, res, next) {
    const userId = req.user.id;
    const sender_name = req.user.username;
    const { address, city, state } = req.body;
    const time = new Date(Date.now()).toLocaleString();
    // console.log('~~~~~current share location');
    // console.log(sender_name);
    const location = new LocationModel({
        sender_id: userId,
        address,
        city,
        state,
        time,
    });
    // await location.persist()
    // .then(() => next())
    // .catch((error) => {
    //     console.error(error)
    //     return res.sendStatus(500);
    // });
    try {
        await location.persist();
        ioInstance.emit('location shared', {
            userId,
            address,
            city,
            state,
            time,
            sender_name,
        });
    } catch (error) {
        console.error('Error sharing location:', error);
        return res.status(500).send('Error sharing location');
    }

    return next();
}

async function updateCurrentLocation(req, res, next) {
    const userId = req.user.id;
    const { address, city, state } = req.body;
    const time = new Date(Date.now()).toLocaleString();

    try {
        await LocationModel.updateUserLocation(
            userId,
            address,
            city,
            state,
            time,
        );
        ioInstance.emit('location updated', {
            userId,
            address,
            city,
            state,
            time,
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return res.status(500).send('Error updating location');
    }

    return next();
}

async function stopSharingCurrentLocation(req, res, next) {
    const userId = req.user.id;

    try {
        await LocationModel.deleteUserLocation(userId);
        ioInstance.emit('location sharing stopped', { userId });
    } catch (error) {
        console.error('Error stopping location sharing:', error);
        return res.status(500).send('Error stopping location sharing');
    }

    return next();
}

async function getAllLocations() {
    return await LocationModel.getAllLocations();
}

export {
    initIOInstanceForLocation,
    shareCurrentLocation,
    updateCurrentLocation,
    stopSharingCurrentLocation,
    getAllLocations,
};
