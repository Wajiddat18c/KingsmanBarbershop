const express = require("express");
const app = express();
const cron = require("node-cron");

const serverPort = process.env.PORT || 4000;

const { Model } = require("objection");
const Knex = require("knex");
const knexfile = require("./knexfile.js");
const session = require("express-session");
app.use(
  session({
    secret: require("./config/config.json").sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const knex = Knex(knexfile.development);

Model.knex(knex);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auto add all from from?
const userRoute = require("./routes/account");
app.use(userRoute);
const bookingRoute = require("./routes/booking");
app.use(bookingRoute);
const customerRoute = require("./routes/customers");
app.use(customerRoute);
const serviceRoute = require("./routes/services");
app.use(serviceRoute);
const productRoute = require("./routes/products");
app.use(productRoute);

const authRoute = require("./routes/auth");
app.use(authRoute);

const booking_services_route = require("./routes/booking_services");
app.use(booking_services_route);
const fs = require("fs");
const footerPage = fs.readFileSync(
    __dirname +  '/./public/footer.html', 
    "utf8"
  );
  const headerPage = fs.readFileSync(
    __dirname + '/./public/header.html', 
    "utf8"
  );

app.get("/", (req, res) => {
	console.log("Hej med dig!");
	res.send(headerPage + "HELLO! NO HTML HERE!" + footerPage);
});

const nodemailer = require("nodemailer");
const { options } = require("./routes/booking");
const mailCreds = require("./config/mailCreds");
const Booking = require("./models/Booking.js");
const Customer = require("./models/Customer");



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

//cron.schedule("0,15,30,45 * * * * *", async () => {
cron.schedule("0 6 * * *", async () => {
	console.log("test");

	const bookings = await Booking.query()
		.select("id", "customer_id", "start_time")
		.whereRaw("DATE(start_time)=CURDATE()");
	bookings.forEach(async (appointment) => {
		const customer = await Customer.query()
			.select("email", "name")
			.findById(appointment.customer_id);

		var transporter = nodemailer.createTransport(mailCreds);

		var mailOptions = {
			from: '"Kingsman Barbershop" <wajidnodemailer@gmail.com>', // sender address (who sends)
			to: `${customer.name} <${customer.email}>`, // list of receivers (who receives)
			subject: `Kingsman barbershop tidsreservation - påmindelse`, // Subject line
			text: `Hej ${customer.name}, husk din tid hos Kingsman barbershop, i dag: ${appointment.start_time}.`, // plaintext body
			html: `Hej ${customer.name}, husk din tid hos Kingsman barbershop, i dag: ${appointment.start_time}.`, // html body
		};
		/*
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}
			
				console.log("Message sent: " + info.response);
			});
			*/
	});
});

app.listen(serverPort, (error) => {
	if (error) {
		console.log(error);
	}
	console.log(`listening on: ${serverPort}`);
});
