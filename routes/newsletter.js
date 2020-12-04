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

  router.get("/newsletter", (req, res) => {
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
        return res.status(400).send({ response: "Email already exists" });
      } else {

        const newEmail = await Email.query().insert({

          email: email

        });
        
        
        var mailOptions = {
            from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
            to: `<${email}>`, // list of receivers (who receives)
            subject: `Bekræftelse på tidsbestilling`, // Subject line
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
    return res
      .status(500)
      .send({ response: "Something went wrong with the database" });
  }

});
        






module.exports = router;