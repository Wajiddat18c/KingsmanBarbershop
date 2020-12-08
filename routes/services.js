const Service = require('../models/Service');
const router = require('express').Router();

const fs = require("fs");


const footerPage = fs.readFileSync(
    __dirname +  '/../public/footer.html', 
    "utf8"
  );
  const headerPage = fs.readFileSync(
    __dirname + '/../public/header.html', 
    "utf8"
  );
  const showService = fs.readFileSync(
    __dirname + '/../public/services.html', 
    "utf8"
  );

router.get("/services", async (req, res) => {
    return res.send(await Service.query().select());
});

router.get("/showservices", async (req, res) => {
    return res.send(headerPage + showService + footerPage);
});



module.exports = router;