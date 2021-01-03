//Author Wajid
const router = require('express').Router();
const User = require('../models/User');


router.get("/accounts", async (req, res) => {
    if(req.session.adminTrue !== true)
        return res.redirect("/")
    return res.send({response: await User.query().select()});
})

router.get("/sessionaccount", async (req, res) => {
    if (req.session.isOn === true) {
        return res.send(await User.query().select("email", "tlf", "name").where("email", req.session.email));
    }
    else{
        return res.send("Not logged in");
    }
})

module.exports = router