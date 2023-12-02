import LocationModel from '../models/location.js';
import { geocodeAddress } from './geocodeAddress.js';

let ioInstance = null;

function initIOInstanceForLocation(io) {
    ioInstance = io;
}

async function shareCurrentLocation(req, res, next) {
    const userId = req.user.id;

    const existingLocations = await LocationModel.getUserLocation(userId);
    if (existingLocations.length > 0) {
        return res.status(409).json({
            message: 'Current location already submitted. Please update your current location in the settings.',
        });
    }

    const sender_name = req.user.username;
    const { address, city, state } = req.body;

    try {
        const coordinates = await geocodeAddress(address, city, state);
        const latitude = coordinates.latitude;
        const longitude = coordinates.longitude;
        const time = new Date(Date.now()).toLocaleString();

        const location = new LocationModel({
            sender_id: userId,
            address,
            city,
            state,
            latitude,
            longitude,
            time,
        });

        await location.persist();
        ioInstance.emit('location shared', {
            userId,
            address,
            city,
            state,
            latitude,
            longitude,
            time,
            sender_name,
        });
    } catch (error) {
        if (error.message === 'Address not found') {
            return res.status(400).json({
                message: 'Invalid address. Please enter a valid address.',
            });
        } else {
            console.error('Error sharing location:', error);
            return res.status(500).send('Error sharing location');
        }
    }

    return next();
}

async function updateCurrentLocation(req, res, next) {
    const userId = req.user.id;
    const { address, city, state } = req.body;
    try {
        const coordinates = await geocodeAddress(address, city, state);
        const latitude = coordinates.latitude;
        const longitude = coordinates.longitude;
        const time = new Date(Date.now()).toLocaleString();

        await LocationModel.updateUserLocation(
            userId,
            address,
            city,
            state,
            latitude,
            longitude,
            time,
        );
        ioInstance.emit('location updated', {
            userId,
            address,
            city,
            state,
            latitude,
            longitude,
            time,
        });
    } catch (error) {
        if (error.message === 'Address not found') {
            return res.status(400).json({
                message: 'Invalid address. Please enter a valid address that can be plotted on a map.',
            });
        } else {
            console.error('Error updating location:', error);
            return res.status(500).send('Error updating location');
        }
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
    }

    return next();
}

async function getAllLocations() {
    return await LocationModel.getAllLocations();
}

async function getUserLocation(sender_id) {
    return await LocationModel.getUserLocation(sender_id);
}

export {
    initIOInstanceForLocation,
    shareCurrentLocation,
    updateCurrentLocation,
    stopSharingCurrentLocation,
    getAllLocations,
    getUserLocation,
};
