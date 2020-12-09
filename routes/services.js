const Service = require("../models/Service");
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
const adminService = fs.readFileSync(
  __dirname + "/../public/adminlogin/admin_service.html",
  "utf8"
);
router.get("/showservices", async (req, res) => {
  //adminlogin
  if (req.session.adminTrue === true) {
    return res.send(adminHeader + adminService + footerPage);
  }
  //userlogin
  else if (req.session.isOn === true) {
    return res.send(UserheaderPage + showService + footerPage);
  }
  return res.send(headerPage + adminService + footerPage);
});
router.get("/services", async (req, res) => {
  return res.send(await Service.query().select());
});

router.post("/services/", async (req, res) => {
  console.log(req.body);
  //const {name, price, duration, description} = req.body
  //Checks if it was deleted
  try{
    return res.send(await Service.query().insertAndFetch(req.body));
  }catch(error){
    console.log(error)
    return res.send("Error creating service.");
  }
  
});
router.put("/services/", async (req, res) => {
  const id = escape(req.body.id);
  const name = escape(req.body.name);
  const price = escape(req.body.price);
  const duration = escape(req.body.duration);
  const description = escape(req.body.description);
  console.log(req.body);
  if ((await Service.query().patch({
      name: name,
      price: price,
      duration: duration,
      description: description
  }).findById(id)) == 1
  ) {
    return res.send("Service updated succesfully.");
  }
    return res.send("Error deleting service.");
});
router.delete("/services/", async (req, res) => {
  const id = escape(req.body.id);
  //Checks if it was deleted
  if ((await Service.query().deleteById(id)) == 1)
    return res.send("Service deleted succesfully.");
  return res.send("Error deleting service.");
});
router.patch("/services", async(req, res) => {
  return "fail";
});





module.exports = router;
