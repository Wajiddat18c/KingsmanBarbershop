const router = require('express').Router();

const { raw } = require('mysql');
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');

router.get("/booking_services/:day", async (req, res) => {
    console.log(req.params.day);
    data = await Booking.query().select("start_time")
    .sum({duration: "duration"})
    .innerJoin("booking_services", "booking.id", "booking_services.booking_id")
    .innerJoin("services", "booking_services.service_id", "services.id")
    .whereRaw("DATE(start_time) = ?", req.params.day)
    .groupBy("booking.id")
    return res.send(data);
});

module.exports = router;