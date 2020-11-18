const router = require('express').Router();
const fs = require('fs');
const escape = require('escape-html');
const nodemailer = require('nodemailer');

const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');

const bookFormPage = fs.readFileSync("__dirname + '/../public/bookform.html", "utf8");
const mailCreds = require("../config/mailCreds");

router.get("/customers", async (req, res) => {
    return res.send({reponse: await Customer.query().select()});
});

router.get("/services", async (req, res) => {
    return res.send(await Service.query().select());
});
router.get("/book", async (req, res) => {
    return res.send(bookFormPage);
});

router.post("/book", async (req, res) => {

    //Noter test korrekte formater for data, eventuelt om kunden allerede findes, 
    //Fjern eventuelt service_id kolonne fra booking tabel
    //Indsæt products
    //Nævn alle services, beregn pris og produkter i mail
    //Eventuelt cancel link

    const email = escape(req.body.email);
    const name = escape(req.body.name);
    const tlf = escape(req.body.tlf);
    const timestamp = escape(req.body.timestamp);
    const service = req.body.service;

    if(service.length>0){

        const customer = await Customer.query().insert({
            name: name,
            email: email,
            tlf: tlf
        });
    
        const appointment = await Booking.query().insert({
            customer_id : customer.id,
            start_time: timestamp,
            service_id: 1
        })

        for(i in service){
            await BookingServices.query().insert({
                booking_id: appointment.id,
                service_id: escape(service[i])
            });
        }

        var transporter = nodemailer.createTransport(mailCreds);
        
        let cancel = "https://localhost:3000/cancel";
        let link = "https://localhost:3000";

        // setup e-mail data
        var mailOptions = {
        from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
        to: `${name} <${email}>`, // list of receivers (who receives)
        subject: `Bekræftelse på tidsbestilling`, // Subject line
        text: `Hej ${name},
            <br>
            <br>Her er en bekræftelse på din tidsbestilling hos Kingsman barbershop, d. ${timestamp}, ${link},
            <br>vil du annullere kan du gøre det her: ${cancel},
            <br>
            <br>Hav en god dag.`, // plaintext body
        html: 
            `Hej ${name}, 
                
                Her er en bekræftelse på din tidsbestilling hos <a href='${link}'>Kingsman barbershop</a>, d. ${timestamp},
                vil du annullere kan du gøre det her: <a href='${cancel}'>${cancel}</a>,
                
                Hav en god dag.`, // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
          
            console.log("Message sent: " + info.response);
        });
    }
    return res.redirect("/book");
})



module.exports = router;