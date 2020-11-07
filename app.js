const express = require("express");
const app = express();

const serverPort = process.env.PORT || 4000;


app.get("/", (req,res) =>{

    res.send("HELLO!");
})

app.listen(serverPort,  (error) => 
{
    if(error)
    {
        console.log(error);
    }
    console.log(`listening on: ${serverPort}`)
});   