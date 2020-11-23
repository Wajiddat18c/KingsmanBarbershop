const router = require('express').Router();

const BookingServices = require('../models/BookingServices');

router.get("/booking_services/:day", async (req, res) => {
    console.log(req.params.day);
    return res.send(await BookingServices.query().select());
});

module.exports = router;