const Product = require('../models/Product');
const router = require('express').Router();

router.get("/products", async (req, res) => {
    return res.send(await Product.query().select());
});

module.exports = router;