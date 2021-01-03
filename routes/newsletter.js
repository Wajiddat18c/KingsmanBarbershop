//Author Wajid

const router = require("express").Router();
const Email = require("../models/Newsletter");

const nodemailer = require('nodemailer');
const mailCreds = require("../config/mailCreds");
const fs = require("fs");


const footerPage = fs.readFileSync(
    __dirname +  '/../public/footer.html', 
    "utf8"
  );
  const headerPage = fs.readFileSync(
    __dirname + '/../public/header.html', 
    "utf8"
  );

  const newsletterSignUpPage = fs.readFileSync(
    __dirname + '/../public/newsletter_signup.html', 
    "utf8"
  );
  const UserheaderPage = fs.readFileSync(
    __dirname + '/../public/userlogin/user_header.html', 
    "utf8"
  );
  const AdminheaderPage = fs.readFileSync(
    __dirname + '/../public/adminlogin/admin_header.html', 
    "utf8"
  );
  const AdminNewsletterPage = fs.readFileSync(
    __dirname + '/../public/adminlogin/admin_newsletter.html', 
    "utf8"
  );

  router.get("/newsletters", async (req, res) => {
    return res.send(await Email.query().select());
  });
  router.delete("/newsletters/", async (req, res) => {
    if(req.session.adminTrue !== true)
      res.redirect("/newsletters")
    const id = escape(req.body.id);
    //Checks if it was deleted
    if ((await Email.query().deleteById(id)) == id)
   
      return res.send("email deleted succesfully.");
    return res.send(AdminheaderPage + AdminNewsletterPage + footerPage);

  });

  router.get("/newsletter", (req, res) => {
        //adminlogin
        if (req.session.adminTrue === true) {
          return res.send(AdminheaderPage+AdminNewsletterPage+footerPage);
  
      } 
      //userlogin
    else if (req.session.isOn === true) {
      return res.send(UserheaderPage + newsletterSignUpPage + footerPage);

    }
    return res.send(headerPage + newsletterSignUpPage + footerPage);
  });

  router.post("/newsletter", (req, res) => {

    const { email} = req.body;
    
    try {

    Email.query()
    .select("email")
    .where("email", email)
    .limit(1)
    .then(async (foundEmail) => {
      if (foundEmail.length > 0) {
        return res.redirect("/error/Already subscribed");
      } else {

        const newEmail = await Email.query().insert({

          email: email

        });
        
        
        var mailOptions = {
            from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
            to: `<${email}>`, // list of receivers (who receives)
            subject: `Bekræftelse på tilmelding af nyhedsbrev`, // Subject line
            text: `Hej,
            
            Her er en bekræftelse på din tilmeling af nyhedsbrev hos Kingsman barbershop,
            
            Hav en god dag.`, // plaintext body
            html:
                `Hej, 
                <br>
                <br>Her er en bekræftelse på din tilmeling af nyhedsbrev hos Kingsman barbershop
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
    return res.redirect("/error/Database error, try again");
  }

});
        






module.exports = router;