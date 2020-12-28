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
      return res.send("LOGIN FIRST!");
    }

  });

  router.get("/showhistory", async(req,res) =>{

  let email = req.session.email

  res.send(await Booking.query().select("booking.id",raw('GROUP_CONCAT(" ", services.name)').as("services"),raw('GROUP_CONCAT(" ", products.name)').as("products"), "customer.name", "start_time")
  .leftJoin("booking_services", "booking.id", "booking_services.booking_id")
  .leftJoin("services", "booking_services.service_id", "services.id")
  .innerJoin("customer", "customer.id", "booking.customer_id")
  .leftJoin("booking_products", "booking.id", "booking_products.booking_id")
  .leftJoin("products", "booking_products.product_id", "products.id")
  .groupBy("booking.id")
  .where("customer.email", email));

    });





module.exports = router;