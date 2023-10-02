import express from 'express';
import cookieParser from 'cookie-parser';

import path from 'path';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import joinRouter from './routes/join.js';
import logoutRouter from './routes/logout.js';
import usersRouter from './routes/users.js';
import welcomeRouter from './routes/welcome.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap-icons', express.static(path.join(__dirname, '/node_modules/bootstrap-icons', 'font')));


app.use('/', indexRouter);
app.use('/join', joinRouter);
app.use('/logout', logoutRouter);
app.use('/users', usersRouter);
app.use('/welcome', welcomeRouter);

export default app;
