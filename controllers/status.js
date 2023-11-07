// get userid，update status by id
async function updateUserStatus(req, res, next) {
    return req.user
        .updateStatus(req.body.status)
        .then(() => next())
        .catch(() => res.sendStatus(500));
}

export default updateUserStatus;
