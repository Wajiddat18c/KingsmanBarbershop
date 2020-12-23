const Product = require('../models/Product');
const router = require('express').Router();
const fs = require('fs');
const { raw } = require('objection');

const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");
const products = fs.readFileSync(__dirname + '/../public/products.html', "utf8");
const header = fs.readFileSync(__dirname + '/../public/header.html', "utf8");
const admin_products = fs.readFileSync(__dirname+ '/../public/adminlogin/admin_products.html', "utf8");
const admin_edit_product = fs.readFileSync(__dirname+ '/../public/adminlogin/admin_edit_product.html', "utf8");

router.get("/products", async (req, res) => {
    return res.send(await Product.query().select("products.id", "products.name", "products.description", "products.price", raw("categories.name as category"))
    .innerJoin("categories", "products.cat_id", "categories.id"));
});

router.get("/showproducts", async(req,res) =>{
    return res.send(await Product.query().select())
});

router.get("/showProduct", (req,res) => {
    return res.send(header + products + footer)
});

router.get("/product/get/:id", async (req, res) =>{
    return res.send(await Product.query().select().where("id", "=", req.params.id));
})

router.get("/admin_products", async (req, res) => {
    //Shows crud site for products
    return res.send(adminHeader + admin_products + footer);
});

router.post("/product", async (req, res) => {
    const { name, description, price, category } = req.body;
    await Product.query().insert({
        name: name,
        description: description,
        price: price,
        cat_id: category
    });
    return res.redirect("/admin_products");
});

router.get("/product/delete/:id", async (req, res) => {
    await Product.query().delete().where("id", "=", req.params.id);
    return res.redirect("/admin_products");
});

router.get("/product/edit/:id", async (req, res) => {
    const extra_html = `<input type=hidden id="id" name="id" value=${req.params.id} />`;
    return res.send(adminHeader + extra_html + admin_edit_product + footer);
});

router.post("/product/edit", async (req, res) => {
    const { name, description, price, category, id } = req.body;
    await Product.query().patch({
        name: name,
        description: description,
        price: price,
        cat_id: category
    }).findById(id)
    return res.redirect("/admin_products"); 
});

module.exports = router;