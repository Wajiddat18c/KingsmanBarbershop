const router = require("express").Router();
const User = require("../models/User");


const mailCreds = require("../config/mailCreds");

const bcrypt = require("bcrypt");
const saltRounds = 12;

const nodemailer = require("nodemailer");

const { v4: uuidv4 } = require('uuid');

const escape = require('escape-html');

const fs = require("fs");

const footerPage = fs.readFileSync(
    __dirname + '/../public/footer.html',
    "utf8"
);
const headerPage = fs.readFileSync(
    __dirname + '/../public/header.html',
    "utf8"
);

const resetpasswordPage = fs.readFileSync(
    __dirname + "/../public/resetpassword.html",
    "utf8"
);
const newpasswordPage = fs.readFileSync(
    __dirname + "/../public/newpassword.html",
    "utf8"
);

router.get("/resetpassword", (req, res) => {
    return res.send(headerPage + resetpasswordPage + footerPage);
})

router.get("/resetpassword/:reset_token", (req, res) => {
    try {

        if(req.params.reset_token === null){
            return res.send({response : "parameter can't be null"});
        }

        User.query()
            .select("tlf")
            .where("reset_token", escape(req.params.reset_token)).
            then(async (foundUser) => {
                if (foundUser.length < 1)
                    return res.send({ response: "incorrect reset_token" });
                else {
                    return res.send(headerPage + newpasswordPage + footerPage);
                }
            })
            .catch(async (PromiseRejectionEvent) => {
                return res.send({ response: "incorrect reset_token" });
            })
    } catch (error) {
        return res.send({ response: error });
    }
})

router.post("/resetpassword", async (req, res) => {
    try {
        const { tlf, email } = req.body;
        const token = uuidv4();
        const count = await User.query()
            .patch({ reset_token: token })
            .where("tlf", tlf)
            .andWhere("email", email);
        if (count < 1) {
            res.send({ response: "incorrect info" });
        }
        else {
            let name = "TEST"

            var mailOptions = {
                from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
                to: `${name} <${email}>`, // list of receivers (who receives)
                subject: `Gendan glemt kodeord`, // Subject line
                text: `Hello ${name}, a password reset request was made, please visit http://localhost:4000/resetpassword/${token}`, // plaintext body
                html: `Hello ${name}, a password reset request was made, please visit <a target="_blank" href="http://localhost:4000/resetpassword/${token}">http://localhost:4000/resetpassword/${token}</a>.`, // html body
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
            return res.send(headerPage + "<h3>Please check your mail</h3><a href=\"\\\">Return to front page</a>" + footerPage);
        }
    }
    catch (err) {
        return res.send({ response: err.message });
    }
})

router.post("/resetpassword/:reset_token", async (req, res) => {
    try {
        const password = escape(req.body.password);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const rowsAffected = await User.query()
            .patch({ password: hashedPassword, reset_token: null })
            .where("reset_token", escape(req.params.reset_token))
        return res.send(headerPage + "<h3>Password changed successfully</h3><a href=\"/login\">Login</a>" + footerPage);
    } catch (error) {
        console.log("new err");
        return res.send({ response: error.message });
    }
})

module.exports = router;