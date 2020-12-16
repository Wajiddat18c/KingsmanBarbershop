const router = require('express').Router();
const fs = require('fs');

const userHeader = fs.readFileSync(__dirname + '/../public/userlogin/user_header.html', "utf8");
const userBookFromPage = fs.readFileSync(__dirname + '/../public/userlogin/user_bookform.html', "utf8");
const adminBookPage = fs.readFileSync(__dirname + '/../public/adminlogin/admin_book.html', "utf8");
const adminHeader = fs.readFileSync(__dirname + '/../public/adminlogin/admin_header.html', "utf8");
const footer = fs.readFileSync(__dirname + '/../public/footer.html', "utf8");

router.get("/admin_booking", async (req, res) => {
    return res.send(adminHeader+adminBookPage+footer);
});
module.exports = router;