import StatusModel from '../models/status.js';
// get userid，update status by id
async function updateUserStatus(req, res, next) {
    return new StatusModel(req.user.id, req.body.status, new Date())
        .persist()
        .then(() => req.user.updateStatus(req.body.status))
        .then(() => next())
        .catch(() => res.sendStatus(500));
}

export default updateUserStatus;
