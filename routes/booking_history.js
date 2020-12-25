const router = require("express").Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const request = require('request');


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

 let info = []


    request('http://localhost:4000/users', async(error, response, body) => {
    console.log('statusCode:', response && response.statusCode); 
    const obj = JSON.parse(body);
    email = obj[0].email
    const cus = await Customer.query()
    .select("*")
    .where("email", email)

    for (let i = 0; i < cus.length; i++) {
        //console.log(cus[i].email)
        //info.push(await Booking.query().withGraphFetched('customer').where("customer_id", cus[i].id))
        info.push(await Booking.query().where("customer_id", cus[i].id))
      }


    return res.send(info)
    });

});



module.exports = router;