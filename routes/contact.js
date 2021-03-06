//Author Ali

const router = require("express").Router();

const mailCreds = require("../config/mailCreds");
const nodemailer = require('nodemailer');

const fs = require("fs");

const footerPage = fs.readFileSync(
  __dirname + "/../public/footer.html",
  "utf8"
);
const headerPage = fs.readFileSync(
  __dirname + "/../public/header.html",
  "utf8"
);

const indexPage = fs.readFileSync( __dirname + "/../public/index.html", "utf8")
const contactForm = fs.readFileSync(
  __dirname + "/../public/contact_form.html",
  "utf8"
);
const UserheaderPage = fs.readFileSync(
  __dirname + '/../public/userlogin/user_header.html', 
  "utf8"
);
router.get("/contact", async(req, res) => {
  if (req.session.isOn === true) {
    return res.send ( UserheaderPage + contactForm + footerPage);
  }else{
    return res.send(headerPage + contactForm + footerPage);
  }
});

router.post("/contact", async(req, res) => {

    const { name, email, question } = req.body;

    var maillist = [
        email,
        mailCreds.auth.user,
      ];

    var mailOptions = {
        from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
        to: `${name} ${maillist}`, // list of receivers (who receives)
        subject: `Spørgsmål til Kingsman`, // Subject line
        text: `Hej ${name},
        
        Her er en bekræftelse på at vi har modtaget din spørgsmål,
        Du kan forvente svar inden for 48 timer.


        Spørgsmål
        ${question}
        
        Hav en god dag.`, // plaintext body
        html:
            `Hej ${name}, 
            <br>
            <br>Her er en bekræftelse på at vi har modtaget din spørgsmål,
            <br>Du kan forvente svar inden for 48 timer.
            <br>
            <br>
            <h4>Spørgsmål </h4>
            <p>${question}</p>
            
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

    return res.send(headerPage + indexPage + footerPage)
});

module.exports = router;
