import StatusModel from '../models/status.js';
// get userid，update status by id
async function updateUserStatus(req, res, next) {
    await new StatusModel(req.user.id, req.body.status, new Date()).persist();
    return req.user
        .updateStatus(req.body.status)
        .then(() => next())
        .catch(() => res.sendStatus(500));
}


export default updateUserStatus;
