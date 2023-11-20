import FloodReportModel from '../models/floodReport.js';

// TODO: add ioInstance

async function createFloodReport(req, res, next) {
    // TODO: check if fields are null/undefined?
    const floodReport = new FloodReportModel({
        address: req.body.address,
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

export {
    createFloodReport,
    getAllFloodReports,
    getFloodReportByID,
    deleteFloodReportByID,
};
