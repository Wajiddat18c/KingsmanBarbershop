//Author Aleksandr and Wajid

const router = require("express").Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const BookingService = require("../models/BookingServices");
const BookingProducts = require("../models/BookingProducts")
const { raw } = require('objection');



const fs = require("fs");

const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
const footerPage = fs.readFileSync(
    __dirname +  '/../public/footer.html', 
    "utf8"
  );

  const historyPage = fs.readFileSync(__dirname + '/../public/userlogin/booking_history.html', "utf-8")


  router.get("/history", (req, res) => {
    if(req.session.isOn == true){
      return res.send( userHeader + historyPage + footerPage);

    }else{
      return res.redirect("/login");
    }

  });

  router.get("/showhistory", async(req,res) =>{

    if(req.session.isOn == true){
      let email = req.session.email


      res.send(await Booking.query().select("booking.id",raw('group_concat(DISTINCT(services.name) separator " ")').as("services"),
      raw('group_concat(distinct(products.name), " , antal:", booking_products.amount)').as("products"),
      raw("SUM(products.price)").as('produktpris'),
      raw('SUM(services.price)').as("ydelsespris"),
      raw('(SUM(services.price)+SUM(products.price))').as("samletpris"),
      "customer.name", "start_time", "customer.tlf")
      .leftJoin("booking_services", "booking.id", "booking_services.booking_id")
      .innerJoin("services", "booking_services.service_id","services.id")
      .leftJoin("booking_products", "booking.id", "booking_products.booking_id")
      .leftJoin("products", "products.id", "booking_products.product_id")
      .innerJoin("customer", "booking.customer_id", "customer.id")
      .groupBy("booking.id")
      .where("customer.email", email)
      .orderBy("booking.start_time", "DESC"));
    }else{
      return res.redirect("/login");
    }
    });





module.exports = router;