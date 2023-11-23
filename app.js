import express from 'express';
import cookieParser from 'cookie-parser';

import path, { dirname } from 'path';
import logger from 'morgan';

import normalOperationsChecker from './middlewares/normalOperationsChecker.js';

import indexRouter from './routes/index.js';
import joinRouter from './routes/join.js';
import welcomeRouter from './routes/welcome.js';
import publicWallRouter from './routes/publicWall.js';
import privateChatRouter from './routes/privateChat.js';
import newMessagesRouter from './routes/newMessages.js';
import performanceTestRouter from './routes/performanceTest.js';
import profileRouter from './routes/profile.js';

/* API */
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    '/bootstrap-icons',
    express.static(
        path.join(__dirname, '/node_modules/bootstrap-icons', 'font'),
    ),
);

app.use(normalOperationsChecker);

app.use('/', indexRouter);
app.use('/join', joinRouter);
app.use('/welcome', welcomeRouter);
app.use('/publicWall', publicWallRouter);
app.use('/privateChat', privateChatRouter);
app.use('/performanceTest', performanceTestRouter);
app.use('/profile', profileRouter);
app.use('/newMessages', newMessagesRouter);

/* API */
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);
app.use('/search', searchRouter);

export default app;
