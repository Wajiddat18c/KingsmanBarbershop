//Author Aleksandr

const router = require('express').Router();

const { raw } = require('mysql');
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');
const Service = require('../models/Service');
const escape = require('escape-html');

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

router.get("/booking_services/", async (req, res) => {
    if(req.session.adminTrue !== true)
        return res.redirect("/")
    data = await Booking.query().select("start_time")
    .sum({duration: "duration"})
    .innerJoin("booking_services", "booking.id", "booking_services.booking_id")
    .innerJoin("services", "booking_services.service_id", "services.id")
    .whereRaw("DATE(start_time) => CURRENT_TIMESTAMP()")
    .groupBy("booking.id")
    return res.send(data);
});

router.get("/booking_services/booking_id/:id", async (req, res) => {
    res.send(await Booking.query().select());
});

router.get("/booking_services/id/:booking_id/service/:id", async (req, res) => {
    if(req.session.adminTrue !== true)
        return res.redirect("/")
    let booking_id = escape(req.params.booking_id);
    let service_id = escape(req.params.id);
    await BookingServices.query().del()
    .where("service_id", "=", service_id)
    .where("booking_id", "=", booking_id);
   res.redirect("/admin_booking/"+booking_id);
});

module.exports = router;