// get userid，update status by id
async function updateUserStatus (req, res, next) {
    const user = req.user;
    try {
        await user.updateStatus(req.body.status);
    } catch (err) {
        return res.sendStatus(500);
    }
    return next();
}

export default updateUserStatus;
