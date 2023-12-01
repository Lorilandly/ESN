import AidRequestModel from '../models/aidRequest.js';

async function createAidRequest(aidRequest) {
    const aidRequestObj = new AidRequestModel(aidRequest);
    await aidRequestObj.persist();
}

async function getAllAidRequests() {
    return AidRequestModel.getAllAidRequests();
}

async function getSubmittedAidRequests(creatorId) {
    return AidRequestModel.getSubmittedAidRequests(creatorId);
}

async function getAcceptedAidRequests(acceptorId) {
    return AidRequestModel.getAcceptedAidRequests(acceptorId);
}

async function getAidRequest(aidRequestId) {
    return AidRequestModel.getAidRequest(aidRequestId);
}

async function updateAidRequest(title, description, priority, aidRequestId) {
    return AidRequestModel.updateAidRequest(
        title,
        description,
        priority,
        aidRequestId,
    );
}

async function cancelAidRequest(aidRequestId) {
    return AidRequestModel.deleteAidRequest(aidRequestId);
}

async function acceptAidRequest(aidRequestId, acceptorId) {
    return AidRequestModel.acceptAidRequest(aidRequestId, acceptorId);
}

async function resolveAidRequest(aidRequestId) {
    return AidRequestModel.deleteAidRequest(aidRequestId);
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
