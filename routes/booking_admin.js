//Author Aleksandr

const router = require("express").Router();
const fs = require("fs");
const { raw } = require("../models/Booking");
const Booking = require("../models/Booking");
const escape = require("escape-html");
const BookingServices = require("../models/BookingServices");
const BookingProducts = require("../models/BookingProducts");

const userHeader = fs.readFileSync(
  __dirname + "/../public/userlogin/user_header.html",
  "utf8"
);
const adminBookPage = fs.readFileSync(
  __dirname + "/../public/adminlogin/admin_book.html",
  "utf8"
);
const adminHeader = fs.readFileSync(
  __dirname + "/../public/adminlogin/admin_header.html",
  "utf8"
);
const footer = fs.readFileSync(__dirname + "/../public/footer.html", "utf8");
const edit_booking = fs.readFileSync(
  __dirname + "/../public/adminlogin/edit_booking.html",
  "utf8"
);

router.get("/admin_booking", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  return res.send(adminHeader + adminBookPage + footer);
});
router.get("/admin_booking/:id", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  let id = escape(req.params.id);
  const extra_html = `<input type=hidden id="booking_id" value=${id} />`;
  return res.send(adminHeader + extra_html + edit_booking + footer);
});
router.get("/admin/bookings", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  res.send(
    await Booking.query()
      .select(
        "booking.id",
        raw('GROUP_CONCAT(" ", services.name)').as("services"),
        "customer.name",
        "start_time"
      )
      .leftJoin("booking_services", "booking.id", "booking_services.booking_id")
      .leftJoin("services", "booking_services.service_id", "services.id")
      .leftJoin("booking_products", "booking.id", "booking_products.booking_id")
      .leftJoin("products", "products.id", "booking_products.product_id")
      .innerJoin("customer", "customer.id", "booking.customer_id")
      .groupBy("booking.id")
      .orderBy("booking.start_time", "DESC")
  );
});
router.get("/admin/booking/get/:id", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  res.send(
    await Booking.query()
      .select("customer.name", "start_time", "customer_id")
      .innerJoin("customer", "customer.id", "booking.customer_id")
      .where("booking.id", req.params.id)
  );
});
router.post("/admin/booking/edit", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  const { customer_id, daydate, timeslot, bid } = req.body;
  const time_stamp = daydate + " " + timeslot;
  console.log(customer_id);
  console.log(daydate);
  console.log(timeslot);
  console.log(bid);
  await Booking.query()
    .patch({
      customer_id: customer_id,
      start_time: time_stamp,
    })
    .findById(bid);
  return res.redirect("/admin_booking");
});

router.get("/booking/delete/:id", async (req, res) => {
  if (req.session.adminTrue !== true) return res.redirect("/");
  let booking_id = req.params.id;
  await BookingServices.query().delete().where("booking_id", "=", booking_id);
  await BookingProducts.query().delete().where("booking_id", "=", booking_id);
  await Booking.query().delete().where("id", "=", booking_id);
  return res.redirect("/admin_booking");
});

router.post("/booking_services/service", async (req, res) => {
    if(req.session.adminTrue !== true)
        return res.redirect("/")
  let booking_id = escape(req.body.bid);
  let service_id = escape(req.body.service);
  console.log(booking_id + ":" + service_id);
  await BookingServices.query().insert({
    booking_id: raw(booking_id),
    service_id: raw(service_id),
  });
  res.redirect("/admin_booking/" + booking_id);
});
router.post("/booking_products/product", async (req, res) => {
    if(req.session.adminTrue !== true)
        return res.redirect("/")
  let booking_id = escape(req.body.bid);
  let product_id = escape(req.body.product);
  let amount = escape(req.body.amount);
  console.log(booking_id + ":" + product_id);
  await BookingProducts.query().insert({
    booking_id: raw(booking_id),
    product_id: raw(product_id),
    amount: amount,
  });
  res.redirect("/admin_booking/" + booking_id);
});

module.exports = router;
