const router = require('express').Router();
const fs = require('fs');
const escape = require('escape-html');
const nodemailer = require('nodemailer');
//const twilio = require('twilio');
const twilioCreds = require('../config/twilioCreds');
const twillio = require('twilio')(twilioCreds.sid, twilioCreds.auth_token);

const bcrypt = require("bcrypt");
const saltRounds = 12;

const Customer = require('../models/Customer');
const User = require("../models/User");
const Booking = require('../models/Booking');
const BookingServices = require('../models/BookingServices');
const BookingProducts = require('../models/BookingProducts');


const header = fs.readFileSync(__dirname + '/../public/header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const bookFormPage = fs.readFileSync(__dirname + '/../public/bookform.html', "utf8");
const booking_services = fs.readFileSync(__dirname+'/../public/book_services.html', 'utf-8');
const booking_products = fs.readFileSync(__dirname+'/../public/book_products.html', 'utf-8');
const booking_dates = fs.readFileSync(__dirname+'/../public/book_dates.html', 'utf-8');
const mailCreds = require("../config/mailCreds");
const Service = require('../models/Service');

const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
const adminBookPage = fs.readFileSync(__dirname + '/../public/adminlogin/admin_book.html', "utf8");
const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");

router.get("/bookings", async (req, res) => {
    
    return res.send(await Booking.query().select());
});

router.get("/book", async (req, res) => {

    if (req.session.isOn === true) {
        return res.send ( userHeader + bookFormPage + footer);
      }else{
    return res.send(header+bookFormPage+footer);
      }
});
router.get("/book/:error", async (req, res) => {
    const error = escape(req.params.error);
    return res.send(header+`<input type="hidden" value="${error}" id="error" />`+bookFormPage+footer);
});

router.get("/unavailable_times", async(req, res) => {
    return res.send(await Booking.query().select("id", "service_id", "start_time").whereRaw("DATE(start_time)>CURRENT_TIMESTAMP()"));
});

async function validate_booking(req, res){
    /*
    That regex will check that the mail address is a non-space separated sequence of characters of length greater than one,
    followed by an @, followed by two sequences of non-spaces characters of length two or more separated by a .
    */
   try{
    if(!req.body.email.match(/^\S{1,}@\S{2,}\.\S{2,}$/))
        return res.redirect("/book/Ugyldig E-mail");
    //Regex matches 8 digits
    if(!req.body.tlf.match(/^\d{8}$/))
        return res.redirect("/book/"+encodeURIComponent("Ugyldigt telefon nummer, format, 8x# : ########"));
    //Regex matches word(s) that's atleast 2 characters
    if(!req.body.name.match(/^[a-zA-z ]{2,}$/))
        return res.redirect("/book/Skriv venligst et navn på minimum 2 bogstaver.");
    //Checks if there's atleast 1 choosen service
    if(req.body.service.length<1)
        return res.redirect("/book/Vælg mindst 1 service.");
    }
    catch(error){
        console.log(error);
        return res.redirect("/book/Ukendt fejl, prøv igen, eller kontakt admininistratoren.");
    }
};

router.post("/book", async (req, res) => {
    //Noter test korrekte formater for data, eventuelt om kunden allerede findes, 
    //Fjern eventuelt service_id kolonne fra booking tabel
    //Indsæt products
    //Nævn alle services, beregn pris og produkter i mail
    //Eventuelt cancel link
    await validate_booking(req, res);
    const email = escape(req.body.email);
    const name = escape(req.body.name);
    
    const tlf = escape(req.body.tlf);
    const create_user = escape(req.body.create_user);
    const timestamp = escape(req.body.daydate)+" "+escape(req.body.timeslot);
    const services = jsonParser(req.body.service);
    const products = jsonParser(req.body.products);


        if(create_user === "on"){
            console.log("test")
            const password = escape(req.body.password);
            console.log(password)
            if (password.length < 8) {
                console.log("test")
                return res.redirect("/book/Password skal være mindst 8 tegn langt");
              } else {
                try {
                  User.query()
                    .select("name")
                    .orWhere("email", email)
                    .limit(1)
                    .then(async (foundUser) => {
                      if (foundUser.length > 0) {
                        return res.redirect("/book/Brugeren findes allerede");
                      } else {
                        const hashedPassword = await bcrypt.hash(password, saltRounds);
          
                        const newUser = await User.query().insert({
                          name: name,
                          password: hashedPassword,
                          email: email,
                          tlf: tlf
                        });
          
                        var mailOptions = {
                          from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
                          to: `${name} <${email}>`, // list of receivers (who receives)
                          subject: `Bekræftelse på tidsbestilling`, // Subject line
                          text: `Hej ${name},
                          
                          Her er en bekræftelse på din registering hos Kingsman barbershop,
                          
                          Hav en god dag.`, // plaintext body
                          html:
                              `Hej ${name}, 
                              <br>
                              <br>Her er en bekræftelse på din registering hos Kingsman barbershop
                              <br>
                              <br>Hav en god dag.`, // html body
                      };
                      
                      // -----------
                      // Send e-mail
                      // -----------
                      var transporter = nodemailer.createTransport(mailCreds);
                      transporter.sendMail(mailOptions, (error, info) => {
                          if (error) {
                            return console.log(error);
                          }
                        
                          console.log("Message sent: " + info.response);
                      });
                        req.session.email = email;
                        req.session.password = password;
                        req.session.isOn = true;
                      }
                    });
                } catch (error) {
                  return res
                    .status(500)
                    .send({ response: "Something went wrong with the database" });
                }
              }
            }
        //Insert customer
        const customer = await Customer.query().insert({
            name: name,
            email: email,
            tlf: tlf
        });
        //Insert booking
        const appointment = await Booking.query().insert({
            customer_id: customer.id,
            start_time: timestamp,
            service_id: 1
        })
        console.log(appointment.id);
        total = 0;
        let mail_items_html = "";
        let mail_items = "";
        
        //Insert services
        
        for (const i in services) {
            const service = services[i];
            total += service.price;
            service_str =
                `- ${service.name}, ${service.price} kr,-
                `;
            mail_items += service_str;
            mail_items_html += service_str + "<br>";
            await BookingServices.query().insert({
                booking_id: appointment.id,
                service_id: escape(service.id)
            });
            
        }
        //Insert products
        let mail_products = "";
        let mail_products_html = "";
        for (const i in products) {
            const product = products[i];
            total += product.price;
            product_str =
                `- ${product.name}, ${product.price} kr,-
                `;
            mail_products += product_str;
            mail_products_html += product_str + "<br>";
            await BookingProducts.query().insert({
                booking_id: appointment.id,
                amount: escape(product.count),
                product_id: escape(product.id)
            });
            
        }

        // -----------------
        // setup e-mail data
        // -----------------
        // vil du annullere kan du gøre det her: ${cancel},
        // <br>vil du annullere kan du gøre det her: <a href='${cancel}'>${cancel}</a>,

        let cancel = "https://localhost:3000/cancel";
        let link = "https://localhost:3000";
        var mailOptions = {
            from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
            to: `${name} <${email}>`, // list of receivers (who receives)
            subject: `Bekræftelse på tidsbestilling`, // Subject line
            text: `Hej ${name},
            
            Her er en bekræftelse på din tidsbestilling hos Kingsman barbershop, d. ${timestamp}, ${link},
            Du har bestilt: 
            
            ${mail_items}
            ${mail_products}

            
            I alt: ${total} kr,-
            
            
            Hav en god dag.`, // plaintext body
            html:
                `Hej ${name}, 
                <br>
                <br>Her er en bekræftelse på din tidsbestilling hos <a href='${link}'>Kingsman barbershop</a>, d. ${timestamp},
                <br>
                <br>Du har bestilt: 
                <br>
                <br>${mail_items_html}
                <br>${mail_products_html}
                <br>
                <br>I alt: ${total} kr,-
                <br>
                <br>Hav en god dag.`, // html body
        };
        
        // -----------
        // Send e-mail
        // -----------
        var transporter = nodemailer.createTransport(mailCreds);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
          
            console.log("Message sent: " + info.response);
        });
        
        // --------
        // Send SMS
        // --------
       try {
        twillio.messages.create({
            to: "+45" + tlf,
            from: twilioCreds.sender_phone_number,
            body: `Hej ${name}, \n\nTak for at du bestilte tid hos Kingsman Barbershop, d. ${timestamp}\n\nKan du ikke alligevel så aflys her: ${cancel}\n\nHilsen Kingsman Barbershop.`
        })
            .then(message => console.log(message.sid));
    } catch (error) {
        console.log(error);
    }
    return res.redirect("/book");
});

function jsonParser(values){
    //Parses JSON sent in form inputs
    let objects = [];
    try{
        //Tries to parse single JSON object
        let value = JSON.parse(values);
        objects.push(value);
    }catch(e){
        try{
            //Tries to parse multiple JSON objects
            for (let i in values) {
                objects.push(JSON.parse(values[i]));
            }
        }
        catch(e){
        }
    }
    return objects;
};

module.exports = router;