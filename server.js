const express = require("express");
const requestIp = require("request-ip");
const fetch = require("node-fetch");
const axios = require("axios");

const app = express();
app.use(requestIp.mw());


app.get("/", (req, res) => res.send("Express app dey work"));

app.get("/api/hello", async (req, res) => {
  try {
    const visitorName = req.query.visitor_name || "Guest";
    const getIp = req.headers["x-forwarded-for"];
    const clientIp = getIp ? getIp.split(/, /)[0] : req.socket.remoteAddress
    console.log("Client IP:", clientIp);

    const { data } = await axios.get(`http://ip-api.com/json/${clientIp}`);

    console.log(data);
  
    const weatherApiKey = "47d0a505327d690ea418623e655afa86";
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${data.city}&appid=${weatherApiKey}&units=metric`;

    console.log("Fetching weather data from:", weatherApiUrl);

    const { data:weatherData} = await axios.get(weatherApiUrl);

    console.log(weatherData)
    const temperature = weatherData.main.temp;

    const response = {
      client_ip: clientIp,
      location: data.city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${data.city}`,
    };

    res.json(response);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


module.exports = app