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
import performanceTestRouter from './routes/performanceTest.js';
import viewLocationRouter from './routes/viewLocation.js';
import floodNoticeRouter from './routes/floodNotices.js';
import aidRequestsPageRouter from './routes/aidRequestsPage.js';
import lostAndFoundRouter from './routes/lostAndFound.js';
import profileRouter from './routes/profile.js';

/* API */
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import shareLocationRouter from './routes/shareLocation.js';
import floodReportRouter from './routes/floodReport.js';
import aidRequestsRouter from './routes/aidRequests.js';

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
app.use('/location-settings', viewLocationRouter);
app.use('/floodNotices', floodNoticeRouter);
app.use('/aidRequestsPage', aidRequestsPageRouter);
app.use('/lostAndFounds', lostAndFoundRouter);
app.use('/profile', profileRouter);

/* API */
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);
app.use('/search', searchRouter);
app.use('/locations', shareLocationRouter);
app.use('/floodReports', floodReportRouter);
app.use('/aidRequests', aidRequestsRouter);

export default app;
