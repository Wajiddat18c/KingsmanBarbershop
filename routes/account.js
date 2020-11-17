const router = require('express').Router();
const User = require('../models/User');


router.get("/accounts", async (req, res) => {
    return res.send({response: await User.query().select()});
})

module.exports = router