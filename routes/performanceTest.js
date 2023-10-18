import express from 'express';
import {
    startPerformanceTestMode,
    endPerformanceTestMode,
} from '../controllers/performanceTest.js';
let router = express.Router();

router.get('/', (req, res) => {
    return res.render('performanceTest');
});

router.post('/start', async (req, res) => {
    const { interval, duration } = req.body;
    await startPerformanceTestMode(duration, interval);
    res.status(201).json({ message: 'testing complete' });
});

router.post('/stop', async (req, res) => {
    console.log(`stopping performance test mode!`);
    await endPerformanceTestMode();
    res.status(201).json({ message: 'testing stopped' });
});

export default router;
