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
    const errors = [];
    if (!validAddress(req.body.address)) {
        errors.push(invalidAddressMessage);
    }
    if (!validCity(req.body.city)) {
        errors.push(invalidCityMessage);
    }
    if (!validState(req.body.state)) {
        errors.push(invalidStateMessage);
    }
    if (!validZipcode(req.body.zipcode)) {
        errors.push(invalidZipcodeMessage);
    }
    if (!validDescription(req.body.description)) {
        errors.push(invalidDescriptionMessage);
    }
    if (errors.length !== 0) {
        return res.sendStatus(400).json({ errors });
    }

    const floodReport = new FloodReportModel({
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        description: req.body.description,
        time: new Date(Date.now()).toLocaleString(),
    });
    floodReport
        .persist()
        .then(() => next())
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
}

async function getAllFloodReports() {
    const floodReports = FloodReportModel.getAll();
    return floodReports;
}

async function getFloodReportByID(floodReportID) {
    return FloodReportModel.findByID(floodReportID);
}

// returns null if no errors are reported, else an array of errors
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
    await FloodReportModel.updateByID(floodReportID, fields);
    return null;
}

async function deleteFloodReportByID(floodReportID) {
    return FloodReportModel.deleteByID(floodReportID);
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
};
