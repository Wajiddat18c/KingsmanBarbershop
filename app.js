const express = require("express");
const app = express();

const serverPort = process.env.PORT || 4000;


var mysql = require('mysql');

var con = mysql.createConnection({
  host: "den1.mysql5.gear.host",
  user: "kingsman",
  password: "dbPassword123!",
  database: "kingsman"

});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO testtable (idtesttable, test123) VALUES ('3', 'Highway 39')";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });

app.get("/", (req,res) =>{

    res.send("HELLO123");
})

app.listen(serverPort,  (error) => 
{
    if(error)
    {
        console.log(error);
    }
    console.log(`listening on: ${serverPort}`)
});   