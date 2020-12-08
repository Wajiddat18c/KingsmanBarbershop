const router = require("express").Router();
const User = require("../models/User");

const mailCreds = require("../config/mailCreds");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const nodemailer = require('nodemailer');

const fs = require("fs");


const footerPage = fs.readFileSync(
    __dirname +  '/../public/footer.html', 
    "utf8"
  );
  const headerPage = fs.readFileSync(
    __dirname + '/../public/header.html', 
    "utf8"
  );
  
  const signupPage = fs.readFileSync(
    __dirname + '/../public/signup.html',
    "utf8"
  );

  const signupsuccessPage = fs.readFileSync(
    __dirname + '/../public/signupsuccess.html',
    "utf8"
  );

  const loginsuccessPage = fs.readFileSync(
    __dirname + '/../public/loginsuccess.html',
    "utf8"
  );

  const loginPage = fs.readFileSync(
    __dirname + '/../public/login.html', "utf8");

    const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
    const userIndexPage = fs.readFileSync(__dirname + '/../public/userlogin/user_index.html', "utf8");
    
    


    //SIGN UP 
  router.get("/signup", (req, res) => {
    return res.send(headerPage + signupPage + footerPage);
  });
  
  router.post("/signup", (req, res) => {
    //sanitize the input (ORM does that for us)
    // User.query().select().then(users => {
    //     return res.status(501).send({Response: users})
  
    const { name, password, email, tlf } = req.body;
  
    if (name && password) {
      // password requirements
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
                req.session.isOn = true;
                req.session.email = email;
                req.session.password = password;
                return res.send(headerPage + signupsuccessPage + footerPage);
              }
            });
        } catch (error) {
          return res
            .status(500)
            .send({ response: "Something went wrong with the database" });
        }
      }
    } else {
      return res
        .status(404)
        .send({ response: "Missing fields: username, password" });
    }
  });

  router.get("/logout", (req, res) => {
    req.session.isOn = false;
  
    return res.redirect("/");
  });
  
  //LOGIN

  router.get("/login", (req, res) => {
    return res.send(headerPage + loginPage + footerPage);
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    try {
      User.query()
        .select("password")
        .where("email", email)
        .limit(1)
        .then((hash) => {
          if (hash.length > 0) {
            let hashpassword = hash[0].password;
  
            bcrypt
              .compare(password, hashpassword)
              .then((result) => {
                if (result === true) {
                  req.session.isOn = true;
                  req.session.email = email;
                  req.session.password = password;
                  return res.redirect("/");
                } else {
                  console.log(req.ip + " typed a wrong password");
                  return res.send({ response: "Wrong password!" });
                }
              })
              .catch((message) => console.log(message));
  
            // return res.status(400).send({ response: "User already exists" });
          } else {
            // return res.send({ response: "User added", username});
            console.log("No user found!");
            return res.send({ response: "No user found!" });
          }
        });
    } catch (error) {
      return res
        .status(500)
        .send({ response: "Something went wrong with the database" });
    }
  });

  router.get("/", (req, res) => {
    if (req.session.isOn === true) {
      return res.send ( userHeader + userIndexPage + footerPage);
    }else{
      return res.send (headerPage + "index page here" + footerPage);

    }

    });

module.exports = router;