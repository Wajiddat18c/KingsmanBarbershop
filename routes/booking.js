const router = require('express').Router();
const fs = require('fs');

const Customer = require('../models/Customer');
const Service = require('../models/Service');
const escape = require('escape-html');


const bookFormPage = fs.readFileSync("__dirname + '/../public/bookform.html", "utf8");


router.get("/customers", async (req, res) => {
    return res.send({reponse: await Customer.query().select()});
});

router.get("/services", async (req, res) => {
    return res.send(await Service.query().select());
});
router.get("/book", async (req, res) => {
    return res.send(bookFormPage);
});

router.post("/savechanges", async (req, res) => {

    email = await escape(req.body.e-mail);
    
    console.log(email);
    
    return res.redirect("/book");
})



module.exports = router;