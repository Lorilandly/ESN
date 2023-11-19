import AidRequestModel from '../models/aidRequest.js';

async function createAidRequest(aidRequest) {
    const aidRequestObj = new AidRequestModel(aidRequest);
    await aidRequestObj.persist();
}

async function getAllAidRequests() {
    return await AidRequestModel.getAllAidRequests();
}

async function getSubmittedAidRequests(creatorId) {
    return await AidRequestModel.getSubmittedAidRequests(creatorId);
}

async function getAcceptedAidRequests(acceptorId) {
    return await AidRequestModel.getAcceptedAidRequests(acceptorId);
}

async function getAidRequest(aidRequestId) {
    return await AidRequestModel.getAidRequest(aidRequestId);
}

async function updateAidRequest(title, description, priority, aidRequestId) {
    return await AidRequestModel.updateAidRequest(
        title,
        description,
        priority,
        aidRequestId,
    );
}

async function cancelAidRequest(aidRequestId) {
    return await AidRequestModel.deleteAidRequest(aidRequestId);
}

async function acceptAidRequest(aidRequestId, acceptorId) {
    return await AidRequestModel.acceptAidRequest(
        aidRequestId,
        acceptorId,
    );
}

async function resolveAidRequest(aidRequestId) {
    return await AidRequestModel.deleteAidRequest(aidRequestId);
}

export {
    createAidRequest,
    getAllAidRequests,
    getSubmittedAidRequests,
    getAcceptedAidRequests,
    getAidRequest,
    updateAidRequest,
    cancelAidRequest,
    acceptAidRequest,
    resolveAidRequest,
};
