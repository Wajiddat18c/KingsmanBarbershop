const Service = require('../models/Service');
const router = require('express').Router();

router.get("/services", async (req, res) => {
    return res.send(await Service.query().select());
});

module.exports = router;