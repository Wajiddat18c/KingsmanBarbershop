//Author Thomas

const Category = require("../models/Category");
const router = require("express").Router();

const fs = require("fs");
const escape = require("escape-html");

const footerPage = fs.readFileSync(
  __dirname + "/../public/footer.html",
  "utf8"
);
const headerPage = fs.readFileSync(
  __dirname + "/../public/header.html",
  "utf8"
);
const showService = fs.readFileSync(
  __dirname + "/../public/services.html",
  "utf8"
);
const UserheaderPage = fs.readFileSync(
  __dirname + "/../public/userlogin/user_header.html",
  "utf8"
);
const adminHeader = fs.readFileSync(
  __dirname + "/../public/adminlogin/admin_header.html",
  "utf8"
);

router.get("/categories", async (req, res) => {
  return res.send(await Category.query().select());
});

module.exports = router;