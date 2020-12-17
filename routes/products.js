const Product = require('../models/Product');
const router = require('express').Router();
const fs = require('fs');
const { raw } = require('objection');

const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const admin_products = fs.readFileSync(__dirname+ '/../public/adminlogin/admin_products.html', "utf8");

router.get("/products", async (req, res) => {
    return res.send(await Product.query().select("products.id", "products.name", "products.description", "products.price", raw("categories.name as category"))
    .innerJoin("categories", "products.cat_id", "categories.id"));
});

router.get("/showproducts", async(req,res) =>{
    return res.send(await Product.query().select())
});

router.get("/admin_products", async (req, res) => {
    return res.send(adminHeader + admin_products + footer);
});

router.post("/product", async (req, res) => {
    const { name, description, price, category } = req.body;
    await Product.query().insert({
        name: name,
        description: description,
        price: price,
        cat_id: category
    })
    return res.redirect("/admin_products");
})

module.exports = router;