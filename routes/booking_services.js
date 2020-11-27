const router = require('express').Router();

const { raw } = require('mysql');
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');
const Service = require('../models/Service');

router.get("/booking_services/:day", async (req, res) => {
    console.log(req.params.day);
    /*
    console.log(req.session.services);
    totaltime = 0;
    for (const i in req.session.services) {
        service = await Service.query().select("duration").where("id", "=", req.session.services[i].id);
        totaltime += service[0].duration;
    }
    console.log(totaltime);
    */
    data = await Booking.query().select("start_time")
    .sum({duration: "duration"})
    .innerJoin("booking_services", "booking.id", "booking_services.booking_id")
    .innerJoin("services", "booking_services.service_id", "services.id")
    .whereRaw("DATE(start_time) = ?", req.params.day)
    .groupBy("booking.id")
    return res.send(data);
});

router.get("/booking_services/", async (req, res) => {
    
    data = await Booking.query().select("start_time")
    .sum({duration: "duration"})
    .innerJoin("booking_services", "booking.id", "booking_services.booking_id")
    .innerJoin("services", "booking_services.service_id", "services.id")
    .whereRaw("DATE(start_time) => CURRENT_TIMESTAMP()")
    .groupBy("booking.id")
    return res.send(data);
});

module.exports = router;