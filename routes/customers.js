//Author Wajid

const Customer = require('../models/Customer');
const Booking = require('../models/Booking')
const BookingerService = require('../models/BookingServices')
const router = require('express').Router();
const fs = require('fs');
const { raw } = require('objection');
const BookingServices = require('../models/BookingServices');
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const customer = fs.readFileSync(__dirname + '/../public/customer.html', "utf8");

//Get all customers
router.get("/customers", async (req, res) => {
    return res.send(await Customer.query().select());
});
router.get("/c", (req, res)=>
{
    return res.send(adminHeader + customer + footer);
})
//Get a specific customer
router.get("/customers/:id", async (req, res) => {
    const id = escape(req.params.id);
    return res.send(await Customer.query().select().where("id", id));
})
//Create customer
router.post("/customers", async(reg, res) =>
{
    const { id, name, email, tlf} = req.body;
    await Customer.query().insert(
        {
            name: name,
            email, email,
            tlf: tlf
        });
});
//Delete customer
router.get("/customers/delete/:id", async(req, res) =>
{
    //Får en fejl: Canoot read property of 'id" of undefined
    //På linje 44
    try
    {
    const booking = await Booking.query().select("id").where("customer_id", "=", req.params.id);
    let bookingId = booking[0].id;
    await BookingServices.query().delete().where("booking_id", "=", booking);
    await Booking.query().delete().where("customer_id", "=", req.params.id);
    await Customer.query().delete().where("id", "=", req.params.id);
    return res.send(adminHeader + customer + footer);
    }
    catch(error)
    {
        console.log(error)
    }
})




module.exports = router;