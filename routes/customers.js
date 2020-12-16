const Customer = require('../models/Customer');
const router = require('express').Router();

router.get("/customers", async (req, res) => {
    return res.send(await Customer.query().select());
});
router.get("/customers/:id", async (req, res) => {
    const id = escape(req.params.id);
    return res.send(await Customer.query().select().where("id", id));
})


module.exports = router;