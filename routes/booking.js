const router = require('express').Router();
const fs = require('fs');
const escape = require('escape-html');
const nodemailer = require('nodemailer');
//const twilio = require('twilio');
const twilioCreds = require('../config/twilioCreds');
const twillio = require('twilio')(twilioCreds.sid, twilioCreds.auth_token);

const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');

const bookFormPage = fs.readFileSync("__dirname + '/../public/bookform.html", "utf8");
const mailCreds = require("../config/mailCreds");



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
    const services = req.body.service;

    if(services.length>0){
        
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
        
        total = 0;
        let mail_items_html = "";
        let mail_items = "";
        try{
        for(i in services){
            let service = JSON.parse(services[i]);
            total += service.price;
            service_str = 
            `- ${service.name}, ${service.price} kr,-
            `;
            mail_items += service_str;
            mail_items_html += service_str + "<br>";
            await BookingServices.query().insert({
                booking_id: appointment.id,
                service_id: escape(services[i])
            });
        }
        }catch(error){
            console.log(error);
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
            
            Her er en bekræftelse på din tidsbestilling hos Kingsman barbershop, d. ${timestamp}, ${link},
            Du har bestilt: 
            
            ${mail_items_html}
            
            I alt: ${total} kr,-
            
            vil du annullere kan du gøre det her: ${cancel},
            
            Hav en god dag.`, // plaintext body
        html: 
            `Hej ${name}, 
                <br>
                <br>Her er en bekræftelse på din tidsbestilling hos <a href='${link}'>Kingsman barbershop</a>, d. ${timestamp},
                <br>vil du annullere kan du gøre det her: <a href='${cancel}'>${cancel}</a>,
                <br>
                <br>Du har bestilt: 
                <br>
                <br>${mail_items_html}
                <br>
                <br>I alt: ${total} kr,-
                <br>
                <br>Hav en god dag.`, // html body
        };
        console.log(tlf);
        try {
            //var tclient = new twilio(twilioCreds.sid, twilioCreds.auth_token)
            twillio.messages.create({
                to: "+45"+tlf,
                from: twilioCreds.sender_phone_number,
                body: `Hej ${name}, \n\nTak for at du bestilte tid hos Kingsman Barbershop, d. ${timestamp}\n\nKan du ikke alligevel så aflys her: ${cancel}\n\nHilsen Kingsman Barbershop.`
            })
            .then(message => console.log(message.sid));
        } catch (error) {
            console.log(error);
        }

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