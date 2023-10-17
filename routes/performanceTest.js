import express from 'express';
import { startPerformanceTestMode } from '../controllers/performanceTest.js';
let router = express.Router();

router.get('/', (req, res) => {
    return res.render('performanceTest');
});

router.post('/start', (req, res) => {
    const { interval, duration } = req.body;
    startPerformanceTestMode(duration, interval);
    res.status(201).json({ message: 'testing complete' });
});

export default router;
