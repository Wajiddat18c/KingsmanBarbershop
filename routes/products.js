const Product = require('../models/Product');
const router = require('express').Router();
const fs = require('fs');

const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const admin_products = fs.readFileSync(__dirname+ '/../public/adminlogin/admin_products.html', "utf8");

router.get("/products", async (req, res) => {
    return res.send(await Product.query().select());
});

router.get("/showproducts", async(req,res) =>{
    return res.send(await Product.query().select())
});

router.get("/admin_products", async (req, res) => {
    return res.send(adminHeader + admin_products + footer);
});

module.exports = router;