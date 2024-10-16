import express from 'express';
import { handleAirData, handleBuoyData, handleVesselData } from '../functions/dummy_handler.js'; 

const router = express.Router();

router.post('/air', async (req, res) => {
    try {
        const data = req.body;
        await handleAirData(data);
        res.status(200).send({ message: "Air data saved." });
    } catch (error) {
        console.error("Error handling air data:", error);
        res.status(500).send({ message: "Error saving air data." });
    }
});

router.post('/buoy', async (req, res) => {
    try {
        const data = req.body;
        await handleBuoyData(data);
        res.status(200).send({ message: "Buoy data saved." });
    } catch (error) {
        console.error("Error handling buoy data:", error);
        res.status(500).send({ message: "Error saving buoy data." });
    }
});

router.post('/vessel', async (req, res) => {
    try {
        const data = req.body;
        await handleVesselData(data);
        res.status(200).send({ message: "Vessel data saved." });
    } catch (error) {
        console.error("Error handling vessel data:", error);
        res.status(500).send({ message: "Error saving vessel data." });
    }
});

module.exports = router; // 라우터 객체 내보내기
