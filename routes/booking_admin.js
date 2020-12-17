const router = require('express').Router();
const fs = require('fs');
const { raw } = require('../models/Booking');
const Booking = require('../models/Booking');
const escape = require('escape-html');
const BookingServices = require('../models/BookingServices');

const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
const userBookFromPage = fs.readFileSync(__dirname + '/../public/userlogin/user_bookform.html', "utf8");
const adminBookPage = fs.readFileSync(__dirname + '/../public/adminlogin/admin_book.html', "utf8");
const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const edit_booking = fs.readFileSync(__dirname+ '/../public/edit_booking.html', "utf8");

router.get("/admin_booking", async (req, res) => {
    return res.send(adminHeader+adminBookPage+footer);
});
router.get("/admin_booking/:id", async (req, res) => {
    let id = escape(req.params.id);
    const extra_html = `<input type=hidden id="booking_id" value=${id} />`;
    return res.send(adminHeader+extra_html+edit_booking+footer);
});
router.get("/admin/bookings", async (req, res) => {
    res.send(await Booking.query().select("booking.id",raw('GROUP_CONCAT(" ", services.name)').as("services"), "customer.name", "start_time")
    .leftJoin("booking_services", "booking.id", "booking_services.booking_id")
    .leftJoin("services", "booking_services.service_id", "services.id")
    .innerJoin("customer", "customer.id", "booking.customer_id")
    .groupBy("booking.id"));
});

router.post("/booking_services/service", async (req, res) => {
    let booking_id = escape(req.body.bid);
    let service_id = escape(req.body.service);
    console.log(booking_id + ":" + service_id);
    await BookingServices.query().insert({
        booking_id: raw(booking_id),
        service_id: raw(service_id)
    });
    res.redirect("/admin_booking/"+booking_id);
});

module.exports = router;