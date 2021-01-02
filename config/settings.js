module.exports = {
    credentials = {
        twillio = {
            sid: "ACbea50d2ce79ec36c01d34e37d7c06e23",
            auth_token: "72391606fc47e226570b8e24f264fbfe",
            sender_phone_number: "+12763651940"
        }, mail = {
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // use SSL
            auth: {
            user: "wajidnodemailer@gmail.com",
            pass: "nodemailer123",
            }
        }, mysql = {
            
                host: "den1.mysql5.gear.host",
                user: "kingsman",
                password: "dbPassword123!",
                database: "kingsman"
            
        }
    },
    server_settings = {
        default_port: 4000,
        session_secret: "my new secret"
    }
}