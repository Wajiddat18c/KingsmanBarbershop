const Customer = require('../models/Customer');
const router = require('express').Router();

router.get("/customers", async (req, res) => {
    return res.send(await Customer.query().select());
});

module.exports = router;