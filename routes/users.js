import express from 'express';
import passport from 'passport';
import updateUserStatus from '../controllers/status.js';
import {
    getUserProfile,
    updateUserProfile,
    addUserProfile,
    removeUserProfile,
    sendHelp,
} from '../controllers/profile.js';

import {
    getUserProfileElements,
    profileChangeValidation,
    updateUserProfileElements,
    userNotFound,
} from '../controllers/profileElement.js';

import {
    setJwtCookie,
    validateNewCredentials,
    deauthenticateUser,
    checkUserAuthenticated,
    requireAdminPrivileges,
} from '../controllers/auth.js';
import { create, getAllActiveUsers, getAllUsers, getUserByName } from '../controllers/user.js';
const router = express.Router();

/* GET all users */
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        return getAllActiveUsers()
            .then((users) => res.status(200).json(users))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500);
            });
    },
);

/* POST new user */
router.post('/', await validateNewCredentials, (req, res) => {
    let { username, password } = req.body;
    username = username.toLowerCase();
    return create(username, password)
        .then((userID) => setJwtCookie(userID, username, 'CITIZEN', res))
        .then((res) => res.status(201).json({}))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put(
    '/status',
    await passport.authenticate('jwt', { session: false }),
    updateUserStatus,
    (req, res) => {
        return res.status(200).json({});
    },
);

// return current user status
router.get(
    '/status',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        return res.status(200).json({ status: req.user.status });
    },
);

router.put(
    '/login',
    passport.authenticate('local', { session: false }),
    (req, res) => {
        return setJwtCookie(
            req.user.id,
            req.user.username,
            req.user.privilege,
            res,
        )
            .then((res) => res.status(200).json({}))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500);
            });
    },
);

router.put(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    deauthenticateUser,
    (req, res) => {
        return res.status(200).json({});
    },
);

router.get('/current', checkUserAuthenticated, async (req, res) => {
    return getUserByName(req.user.username)
        .then((user) => res.status(200).json(user))
        .catch((error) => {
            console.error(error);
            return res.sendStatus(400);
        });
});

router.get(
    '/profile/all',
    passport.authenticate('jwt', { session: false }),
    requireAdminPrivileges,
    (req, res) => {
        return res.render('adminUsers');
    },
);

/** Get profile of another user
 * @argument UserId
 */
router.get(
    '/:id/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        getUserProfile(req.params.id, false)
            .then((profile) => res.status(200).json(profile))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

/** Get current user profile */
router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        getUserProfile(req.user.id, true)
            .then((profile) => res.status(200).json(profile))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

/** Update current user profile */
router.put(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        updateUserProfile(req.user.id, req.body)
            .then(() => res.status(200).json({}))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

/** Add to current user profile */
router.post(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        addUserProfile(req.user.id, req.body.key)
            .then(() => res.status(200).json({}))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

/** Delete from current user profile */
router.delete(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        removeUserProfile(req.user.id, req.body.key)
            .then(() => res.status(200).json({}))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

router.get(
    '/help',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        sendHelp(req.user)
            .then(() => res.status(200).json({}))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) =>
        getUserProfileElements(req.params.id)
            .then((profile) => res.status(200).json(profile))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    requireAdminPrivileges,
    (req, res) =>
        updateUserProfileElements(req.params.id, req.body)
            .then((action) => {
                if (action.updated) {
                    return res.status(200).json({});
                } else {
                    if (action.reason === userNotFound) {
                        return res.sendStatus(404);
                    }
                    return res.status(400).json(action.errors);
                }
            })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500);
            }),
);

router.get(
    '/:id/validation',
    passport.authenticate('jwt', { session: false }),
    requireAdminPrivileges,
    (req, res) =>
        profileChangeValidation(req.params.id, req.query)
            .then(() => res.status(200).json({ message: 'Valid' }))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(400);
            }),
);

router.get(
    '/accounts/all',
    passport.authenticate('jwt', { session: false }),
    requireAdminPrivileges,
    (req, res) =>
        getAllUsers()
            .then((users) => res.status(200).json(users))
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500);
            }),
);

export default router;
