const router = require("express").Router();
const User = require("../models/User");

const mailCreds = require("../config/mailCreds");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const nodemailer = require('nodemailer');

const userInfo = [{"id": 1, "email": "email123", "name": "name123", "tlf": "tlf"}];
const eMail = ""

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

  const userAccount = fs.readFileSync(
    __dirname + '/../public/userlogin/account.html',
    "utf8"
  );


  const loginPage = fs.readFileSync(
    __dirname + '/../public/login.html', "utf8");

    const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
    const userIndexPage = fs.readFileSync(__dirname + '/../public/userlogin/user_index.html', "utf8");
    const IndexPage = fs.readFileSync(__dirname + '/../public/index.html', "utf8");

    const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
    const adminIndexPage = fs.readFileSync(__dirname + '/../public/adminlogin/admin_index.html', "utf8");

    


    //SIGN UP 
  router.get("/signup", (req, res) => {
    return res.send(headerPage + signupPage + footerPage);
  });
  router.get("/signup/:error", (req, res) => {
    let extrahtml = `<input type="hidden" value="${req.params.error}" id="error" />`;
    return res.send(headerPage + extrahtml+ signupPage + footerPage);
  });

  async function validate_user(req, res){
    /*
    That regex will check that the mail address is a non-space separated sequence of characters of length greater than one,
    followed by an @, followed by two sequences of non-spaces characters of length two or more separated by a .
    */
   try{
    if(!req.body.email.match(/^\S{1,}@\S{2,}\.\S{2,}$/))
        return res.redirect("/signup/Ugyldig E-mail");
    //Regex matches 8 digits
    if(!req.body.tlf.match(/^\d{8}$/))
        return res.redirect("/signup/"+encodeURIComponent("Ugyldigt telefon nummer, format, 8x# : ########"));
    //Regex matches word(s) that's atleast 2 characters
    if(!req.body.name.match(/^[a-zA-z ]{2,}$/))
        return res.redirect("/signup/Skriv venligst et navn på minimum 2 bogstaver.");
    //Checks if there's atleast 1 choosen service
    if (req.body.password.length < 8) 
      return res.redirect("/signup/Kodeordet er for kort, brug mindst 8 tegn.");
    }
    catch(error){
        console.log(error);
        return res.redirect("/signup/Ukendt fejl, prøv igen, eller kontakt admininistratoren.");
    }
};
  
  router.post("/signup", async (req, res) => {
    //sanitize the input (ORM does that for us)
    // User.query().select().then(users => {
    //     return res.status(501).send({Response: users})
  
    
  
    await validate_user(req, res);
    const { name, password, email, tlf } = req.body;
        try {
          User.query()
            .select("email")
            .where("email", email)
            // .orWhere("name", name)
            //.orWhere("tlf", tlf)
            .limit(1)
            .then(async (foundUser) => {
              if (foundUser.length > 0) {
                return res.redirect("/signup/E-mailen er allerede i brug, log ind eller gendan kodeordet.");
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
                // TODO: Auto login on sign up?
                // req.session.isOn = true;
                // userInfo[0].email = email

                req.session.email = email;
                req.session.password = password;

                return res.send(headerPage + signupsuccessPage + footerPage);
              }
            });
        } catch (error) {
          return res.redirect("/signup/Noget gik galt i databasen, prøv igen.");
        }
    
  });

  router.get("/logout", (req, res) => {
    req.session.isOn = false;
    req.session.adminTrue = false;
    return res.redirect("/");
  });
  
  //LOGIN

  router.get("/login", (req, res) => {
    return res.send(headerPage + loginPage + footerPage);
  });
  router.get("/login/:error", (req, res) => {
    let extrahtml = `<input type="hidden" value="${req.params.error}" id="error" />`
    return res.send(headerPage + extrahtml + loginPage + footerPage);
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
                //admin email: kingsmanBS@gmail.com
                //admin pw: admin123
                if (result === true && email == "kingsmanBS@gmail.com" ){
                  req.session.adminTrue = true;
                  req.session.isOn = true;
                  req.session.email = email;
                  req.session.password = password;
                  return res.redirect("/");

                }
                else if (result === true) {
                  req.session.isOn = true;
                  req.session.email = email;
                  req.session.password = password;

                  userInfo[0].email = email

                  return res.redirect("/");
                } else {
                  console.log(req.ip + " typed a wrong password");
                  return res.redirect("/login/Forkert login");
                }
              })
              .catch((message) => console.log(message));
  
            // return res.status(400).send({ response: "User already exists" });
          } else {
            // return res.send({ response: "User added", username});
            console.log("No user found!");
            return res.redirect("/login/Forkert login");
          }
        });
    } catch (error) {
      return res.redirect("/login/Forkert login");
    }
  });

  router.get("/users", async (req, res) => {

    let mail = userInfo[0].email;
    const user = await User.query()
    .select("*")
    .where("email", mail).limit(1)

    
    userInfo[0].name = user[0].name
    userInfo[0].tlf = user[0].tlf

    return res.send(userInfo);
  });

  router.get("/userAccount", (req, res) => {
    if(req.session.isOn == true){
      return res.send( userHeader + userAccount + footerPage);

    }else{
      return res.redirect("/login");
    }



  });

  router.get("/userAccount/delete/:email", async (req, res) => {
    await User.query().delete().where("email", "=", req.params.email);
    req.session.isOn == false;
    return res.redirect("/logout");
});

  router.get("/", (req, res) => {
    if (req.session.adminTrue === true){

    return res.send(adminHeader + adminIndexPage + footerPage);
    }

    else if (req.session.isOn === true) {
      return res.send ( userHeader + IndexPage + footerPage);
    }else{
      
      return res.send (headerPage + IndexPage + footerPage);
    }

    });

    router.get("/", (req, res) => {
      if (req.session.adminTrue === true){
  
      return res.send(adminHeader + adminIndexPage + footerPage);
      }
  
      else if (req.session.isOn === true) {
        return res.send ( userHeader + IndexPage + footerPage);
      }else{
        
        return res.send (headerPage + IndexPage + footerPage);
      }
  
      });
      router.get("/error/:error", (req, res) => {
        let extrahtml = `<input type="hidden" value="${req.params.error}" id="error" />`
        if (req.session.adminTrue === true){
    
        return res.send(adminHeader + extrahtml+ adminIndexPage + footerPage);
        }
    
        else if (req.session.isOn === true) {
          return res.send ( userHeader + extrahtml+ IndexPage + footerPage);
        }else{
          
          return res.send (headerPage + extrahtml+ IndexPage + footerPage);
        }
    
        });

    

module.exports = router;