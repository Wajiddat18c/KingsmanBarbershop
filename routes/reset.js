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
    return res.send(headerPage  + resetpasswordPage + footerPage);
});

router.get("/resetpassword/error/:error", (req, res) => {
    let extrahtml = `<input type="hidden" value="${req.params.error}" id="error" />`;
    return res.send(headerPage + extrahtml + resetpasswordPage + footerPage);
});

router.get("/resetpassword/:reset_token", (req, res) => {
    try {
        const reset_token = escape(req.params.reset_token);
        if(reset_token === null){
            return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.`);
        }
        User.query()
            .select("tlf")
            .where("reset_token", reset_token).
            then(async (foundUser) => {
                if (foundUser.length < 1)
                    return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.`);
                else {
                    return res.send(headerPage + newpasswordPage + footerPage);
                }
            })
            .catch(async (reject) => {
                console.log(reject)
                return res.redirect("/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.");
            })
    } catch (error) {
        console.log(error);
        return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin..`);
    }
});
router.get("/resetpassword/:reset_token/error/:error", (req, res) => {
    try {
        const reset_token = escape(req.params.reset_token);
        if(reset_token === null){
            return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.`);
        }
        User.query()
            .select("tlf")
            .where("reset_token", reset_token).
            then(async (foundUser) => {
                if (foundUser.length < 1)
                    return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.`);
                else {
                    let extrahtml = `
                    <input type="hidden" value="${req.params.error}" id="error" />
                    <input type="hidden" value="${reset_token}" id="reset_token" />
                    `;
                    return res.send(headerPage + extrahtml + newpasswordPage + footerPage);
                }
            })
            .catch(async (reject) => {
                console.log(reject)
                return res.redirect("/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.");
            })
    } catch (error) {
        console.log(error);
        return res.redirect(`/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin..`);
    }
});


router.post("/resetpassword", async (req, res) => {
    try {
        const { tlf, email } = req.body;
        const token = uuidv4();
        const count = await User.query()
            .patch({ reset_token: token })
            .andWhere("email", email);
        if (count < 1) {
            res.send({ response: "incorrect info" });
        }
        else {
            let name = ""

            var mailOptions = {
                from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
                to: `<${email}>`, // list of receivers (who receives)
                subject: `Gendan glemt kodeord`, // Subject line
                text: `Hej din anmodning af gendannelse af password, besøg for at gendanne https://kingsmanbarbershop.herokuapp.com//resetpassword/${token}`, // plaintext body
                html: `Hej din anmodning af gendannelse af password, besøg for at gendanne <a target="_blank" href="https://kingsmanbarbershop.herokuapp.com/resetpassword/${token}">https://kingsmanbarbershop.herokuapp.com/resetpassword/${token}</a>.`, // html body
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
            return res.send(headerPage + "<h3>Vi har nu sendt en email til den angivne mail</h3><a href=\"\\\">Tilbage til forside</a>" + footerPage);
        }
    }
    catch (err) {
        return res.send({ response: err.message });
    }
})

router.post("/resetpassword/:reset_token", async (req, res) => {
    try {
        const password = escape(req.body.password);
        const reset_token = escape(req.params.reset_token);
        if(password.length<8)
            return res.redirect(`/resetpassword/${reset_token}/error/Kodeordet skal være mindst 8 tegn.`);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const affectedRows = await User.query()
        .update({ password: hashedPassword, reset_token: null })
        .where("reset_token", reset_token);
        if(affectedRows>0)
            return res.send(headerPage + "<h3>Password changed successfully</h3><a class='btn btn-info' href=\"/login\">Login</a>" + footerPage);
        else
            return res.redirect("/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.");
    } catch (error) {
        console.log("password change error: "+error);
        return res.redirect("/resetpassword/error/Ugyldig token, prøv igen. Få tilsendt nyt nedenunder eller kontakt admin.");
    }
})

module.exports = router;