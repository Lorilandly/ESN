import { readFileSync } from 'fs';
import FloodReportModel from '../models/floodReport.js';

let ioInstance = null;
const stateOptions = [];
const stateAbbreviations = new Set();

function initFloodReportController(io, config) {
    ioInstance = io;
    // initialize available states in accordance with the state selection rule
    initStateDataFromFile(config.stateAbbreviations);
}

async function createFloodReport(req, res, next) {
    const { address, city, state, zipcode, description } = req.body;
    const errors = [];
    if (!validAddress(address)) {
        errors.push(invalidAddressMessage);
    }
    if (!validCity(city)) {
        errors.push(invalidCityMessage);
    }
    if (!validState(state)) {
        errors.push(invalidStateMessage);
    }
    if (!validZipcode(zipcode)) {
        errors.push(invalidZipcodeMessage);
    }
    if (!validDescription(description)) {
        errors.push(invalidDescriptionMessage);
    }
    if (errors.length !== 0) {
        return res.status(400).json({ errors });
    }

    const floodReport = new FloodReportModel({
        address,
        city,
        state,
        zipcode,
        description,
        time: new Date(Date.now()).toLocaleString(),
    });
    const floodReportID = floodReport
        .persist()
        .then(() => next())
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
    ioInstance.emit('create-flood-report', {
        id: floodReportID,
        address,
        city,
        state,
        zipcode,
        description,
        time: floodReport.time,
    });

    next();
}

async function getAllFloodReports() {
    return FloodReportModel.getAll();
}

async function getFloodReportByID(floodReportID) {
    return FloodReportModel.findByID(floodReportID);
}

async function updateFloodReportByID(floodReportID, fields) {
    const errors = [];
    if (fields.address && !validAddress(fields.address)) {
        errors.push(invalidAddressMessage);
    }
    if (fields.city && !validCity(fields.city)) {
        errors.push(invalidCityMessage);
    }
    if (fields.state && !validState(fields.state)) {
        errors.push(invalidStateMessage);
    }
    if (fields.zipcode && !validZipcode(fields.zipcode)) {
        errors.push(invalidZipcodeMessage);
    }
    if (fields.description && !validDescription(fields.description)) {
        errors.push(invalidDescriptionMessage);
    }
    if (errors.length !== 0) {
        return errors;
    }
    const floodReportData = await FloodReportModel.updateByID(
        floodReportID,
        fields,
    );
    if (floodReportData === null) {
        return false;
    }
    ioInstance.emit('updated-flood-report', {
        id: floodReportID,
        address: floodReportData.address,
        city: floodReportData.city,
        state: floodReportData.state,
        zipcode: floodReportData.zipcode,
        description: floodReportData.description,
        time: floodReportData.time,
    });
    return true;
}

async function deleteFloodReportByID(floodReportID) {
    const deleted = await FloodReportModel.deleteByID(floodReportID);
    if (deleted) {
        ioInstance.emit('delete-flood-report', floodReportID);
    }
    return deleted;
}

function initStateDataFromFile(filepath) {
    const raw = readFileSync(filepath, 'utf-8');
    const lines = raw.trim().split('\n');

    lines.forEach((line) => {
        const [abbreviation, name] = line.split(',');
        stateAbbreviations.add(abbreviation);
        stateOptions.push({ abbreviation, name });
    });
}

// Flood Report Validity Rules

const invalidAddressMessage = 'Address must be between 5 and 100 characters';

function validAddress(address) {
    if (!address) {
        return false;
    }
    const addrlen = address.trim().length;
    return addrlen >= 5 <= 100 && addrlen >= 5;
}

const invalidCityMessage = 'City must be between 5 and 100 characters';

function validCity(city) {
    if (!city) {
        return false;
    }
    const citylen = city.trim().length;
    return citylen >= 2 && citylen <= 50;
}

const invalidStateMessage = 'State not a recognized US state abbreviation';

function validState(state) {
    if (!state) {
        return false;
    }
    return stateAbbreviations.has(state);
}

const invalidZipcodeMessage = 'Zipcode must be exactly 5 digits';

function validZipcode(zipcode) {
    if (!zipcode) {
        return false;
    }
    return zipcode.length === 5 && !isNaN(Number(zipcode));
}

const invalidDescriptionMessage = 'Description cannot exceed 200 characters';

function validDescription(description) {
    if (!description) {
        return true;
    }
    return description.length <= 200;
}

export {
    initFloodReportController,
    stateOptions,
    createFloodReport,
    getAllFloodReports,
    getFloodReportByID,
    updateFloodReportByID,
    deleteFloodReportByID,
    validAddress,
    validCity,
    validState,
    validZipcode,
    validDescription,
    invalidAddressMessage,
    invalidCityMessage,
    invalidStateMessage,
    invalidZipcodeMessage,
    invalidDescriptionMessage,
};
