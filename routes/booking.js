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
const userBookFromPage = fs.readFileSync(__dirname + '/../public/userlogin/user_bookform.html', "utf8");


router.get("/book", async (req, res) => {
    //userlogin
    if (req.session.isOn === true) {
        return res.send(userHeader+userBookFromPage+footer);

    }

    return res.send(header+bookFormPage+footer);
});
router.get("/book/:error", async (req, res) => {
    const error = escape(req.params.error);
    return res.send(header+`<input type="hidden" value="${error}" id="error" />`+bookFormPage+footer);
});

router.get("/unavailable_times", async(req, res) => {
    return res.send(await Booking.query().select("id", "service_id", "start_time").whereRaw("DATE(start_time)>CURRENT_TIMESTAMP()"));
});

router.get("/booking/:error", async (req, res) => {
    const error = escape(req.params.error);
    return res.send(header+`<input type="hidden" value="${error}" id="error" />`+booking_services+footer);
});

router.get("/booking", async (req, res) => {
    return res.send(header+booking_services+footer);
});

function validate_services(req, res){
    /*
    That regex will check that the mail address is a non-space separated sequence of characters of length greater than one,
    followed by an @, followed by two sequences of non-spaces characters of length two or more separated by a .
    */
   try{
    if(!req.session.email.match(/^\S{1,}@\S{2,}\.\S{2,}$/))
        return res.redirect("/booking/Ugyldig E-mail");
    //Regex matches 8 digits
    if(!req.session.tlf.match(/^\d{8}$/))
        return res.redirect("/booking/"+encodeURIComponent("Ugyldigt telefon nummer, format, 8x# : ########"));
    //Regex matches word(s) that's atleast 2 characters
    if(!req.session.name.match(/^\w{2,}$/))
        return res.redirect("/booking/Skriv venligst et navn på minimum 2 bogstaver.");
    //Checks if there's atleast 1 choosen service
    if(req.session.services.length<1)
        return res.redirect("/booking/Vælg mindst 1 service.");
    }
    catch(error){
        console.log(error);
        return res.redirect("/booking/Ukendt fejl, prøv igen, eller kontakt admininistratoren.");
    }
};
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
    if(!req.body.name.match(/^\w{2,}$/))
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

router.post("/booking_products", async (req, res) => {
    req.session.email = escape(req.body.email);
    req.session.name = escape(req.body.name);
    req.session.tlf = escape(req.body.tlf);
    services = jsonParser(req.body.service);

    
    //Adds service json object to session.
    req.session.services = [];
    for (const i in services) {
            const service = services[i];
            req.session.services.push({id: service.id, name: service.name, price: service.price});
    }
    
    validate_services(req,res);

    return res.send(header+booking_products+footer);
});

router.post("/booking_dates", async (req, res) => {
    validate_services(req, res);
    products = jsonParser(req.body.products);
    req.session.products = [];
    for (const i in products) {
        const product = products[i];
        req.session.products.push({id: product.id, name: product.name, price: product.price, count: product.count});
    }
    console.log(req.session.products);
    totaltime = 0;
    for (const i in req.session.services) {
        service = await Service.query().select("duration").where("id", "=", req.session.services[i].id);
        totaltime += service[0].duration;
    }
    const duration_html = `<input type=hidden id="duration" value=${totaltime} />`;
    return res.send(header+duration_html+booking_dates+footer);
});
router.post("/booking", async (req, res) => {
    validate_services(req,res);
    console.log(req.body.timeslot);
    console.log(req.body.daydate);
    req.session.timestamp = escape(req.body.daydate)+" "+escape(req.body.timeslot);
    //Insert customer
    const customer = await Customer.query().insert({
        name: req.session.name,
        email: req.session.email,
        tlf: req.session.tlf
    });
    //Insert booking
    console.log(req.session.timestamp);
    const appointment = await Booking.query().insert({
        customer_id: customer.id,
        start_time: req.session.timestamp,
        service_id: 1
    });
    let total = 0;
    let mail_items = "";
    let mail_items_html = "";
    //Insert services
    for (const i in req.session.services) {
        const service = req.session.services[i];
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
    for (const i in req.session.products) {
        const product = req.session.products[i];
        total += product.price;
        product_str =
            `- ${product.name}, ${product.price} kr,-
            `;
        mail_products += product_str;
        mail_products_html += product_str + "<br>";
        await BookingProducts.query().insert({
            booking_id: appointment.id,
            amount: 1,
            product_id: escape(product.id)
        });
        
    }
    return res.send("success "+total);
    
})

router.post("/book", async (req, res) => {
    //Noter test korrekte formater for data, eventuelt om kunden allerede findes, 
    //Fjern eventuelt service_id kolonne fra booking tabel
    //Indsæt products
    //Nævn alle services, beregn pris og produkter i mail
    //Eventuelt cancel link
    await validate_booking(req, res);
    const email = escape(req.body.email);
    const name = escape(req.body.name);
    const password = escape(req.body.password);
    const tlf = escape(req.body.tlf);
    //const timestamp = escape(req.body.timestamp);
    const timestamp = escape(req.body.daydate)+" "+escape(req.body.timeslot);
    const services = jsonParser(req.body.service);
    const products = jsonParser(req.body.products);



        if(password == undefined){
            console.log("pw", password);
            console.log(password.length);
            if (password.length < 8) {
                return res
                  .status(400)
                  .send({ response: "Password must be atleast 8 char long" });
              } else {
                try {
                  User.query()
                    .select("name")
                    .where("name", name)
                    .orWhere("email", email)
                    .orWhere("tlf", tlf)
                    .limit(1)
                    .then(async (foundUser) => {
                      if (foundUser.length > 0) {
                        return res.status(400).send({ response: "User already exists" });
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
          
                        return res.redirect("/");
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