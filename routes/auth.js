const router = require("express").Router();
const User = require("../models/User");


const bcrypt = require("bcrypt");
const saltRounds = 12;


const { v4: uuidv4 } = require('uuid');


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


  router.get("/signup", (req, res) => {
    return res.send(headerPage + signupPage + footerPage);
  });
  

module.exports = router;