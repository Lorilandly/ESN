// get userid，update status by id
async function updateUserStatus(req, res, next) {
    let user = req.user;
    console.log(user);
    try {
        await user.updateStatus(req.body.status);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
    return next();
}

export default updateUserStatus;
