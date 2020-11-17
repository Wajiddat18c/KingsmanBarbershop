const express = require("express");
const app = express();

const serverPort = process.env.PORT || 4000;

const { Model } = require("objection");
const Knex = require("knex");
const knexfile = require("./knexfile.js");

const knex = Knex(knexfile.development);

Model.knex(knex);

const userRoute = require('./routes/account');
app.use(userRoute);

const bookingRoute = require('./routes/booking');
app.use(bookingRoute);

/* var mysql = require('mysql');

var con = mysql.createConnection({
  host: "den1.mysql5.gear.host",
  user: "kingsman",
  password: "dbPassword123!",
  database: "kingsman"

});

*/

app.get("/", (req, res) => {
  res.send("HELLO123");
});

app.get("/table", (req, res) => {
  knex.schema
    .createTable("cars", (table) => {
      table.increments("id");
      table.string("name");
      table.integer("price");
    })
    .then(() => console.log("table created"))
    .catch((err) => {
      console.log(err)
      throw err;
    })
    .finally(() => {
      knex.destroy();

    });

  res.send("test");
});

const nodemailer = require("nodemailer");

const mailCreds = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: "wajidnodemailer@gmail.com",
    pass: "nodemailer123",
  },
};

var transporter = nodemailer.createTransport(mailCreds);
let username = "alex";
let email = "wajid2665123@gmail.com";
// setup e-mail data
var mailOptions = {
  from: '"Chat app " <wajidnodemailer@gmail.com>', // sender address (who sends)
  to: `${username} <${email}>`, // list of receivers (who receives)
  subject: `Congrats ${username}! Happy chatting!`, // Subject line
  text: `Welcome ${username} to the chat app, join the room to chat with other online users`, // plaintext body
  html: `Welcome ${username} to the chat app, join the room to chat with other online users`, // html body
};

// send mail with defined transport object

/*
transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    return console.log(error);
  }

  console.log("Message sent: " + info.response);
});
*/

app.listen(serverPort, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`listening on: ${serverPort}`);
});
