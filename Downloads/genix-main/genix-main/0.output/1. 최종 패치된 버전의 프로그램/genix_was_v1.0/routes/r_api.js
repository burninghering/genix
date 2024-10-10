import express from "express";
import db_manager from '../functions/db_manager.js';
import Instance from '../variable/Instance.js';
var router = express.Router();

router.post('/', function (req, res) {
    res.status(200).send("API?");
});

module.exports = router;