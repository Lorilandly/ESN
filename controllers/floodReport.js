import { readFileSync } from 'fs';
import FloodReportModel from '../models/floodReport.js';

let ioInstance = null;
let stateAbbreviations = null;

function initFloodReportController(io, config) {
    ioInstance = io;
    // initialize available states in accordance with the state selection rule
    stateAbbreviations = loadStateAbbreviationsFromFile(
        config.stateAbbreviations,
    );
}

async function createFloodReport(req, res, next) {
    // TODO: check if fields are null/undefined?
    console.log(`req.body: ${JSON.stringify(req.body)}`);
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

async function deleteFloodReportByID(floodReportID) {
    return FloodReportModel.deleteByID(floodReportID);
}

function loadStateAbbreviationsFromFile(filepath) {
    const raw = readFileSync(filepath, 'utf-8');
    const lines = raw.trim().split('\n');
    const states = [];

    lines.forEach((line) => {
        const [abbreviation, name] = line.split(',');
        states.push({ abbreviation, name });
    });
    return states;
}

export {
    initFloodReportController,
    stateAbbreviations,
    createFloodReport,
    getAllFloodReports,
    getFloodReportByID,
    deleteFloodReportByID,
};
