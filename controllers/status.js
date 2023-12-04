import StatusModel from '../models/status.js';
// get userid，update status by id
async function updateUserStatus(user, status) {
    return new StatusModel(user.id, status, new Date())
        .persist()
        .then(() => user.updateStatus(status));
}

export default updateUserStatus;
