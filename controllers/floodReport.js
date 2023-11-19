import FloodReportModel from '../models/floodReport.js';

// TODO: add ioInstance

async function createFloodReport(req, res, next) {
    // TODO: check if fields are null/undefined?
    const floodReport = new FloodReportModel({
        address: req.address,
        state: req.state,
        zipcode: req.zipcode,
        description: req.description,
        time: new Date(Date.now()).toLocaleString(),
    });
    floodReport
        .persist()
        .then(() => next())
        .catch((err) => {
            console.log(err);
            return res.sendStatus(500);
        });
}

async function getAllFloodReports() {
    return FloodReportModel.getAll();
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
