const express = require('express');
const requestIp = require('request-ip');
const geoipLite = require('geoip-lite');
const fetch = require('node-fetch');

const app = express();
app.use(requestIp.mw());

app.get('/api/hello', async (req, res) => {
  try {
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.clientIp;
    console.log('Client IP:', clientIp); 

    const geo = geoipLite.lookup(clientIp);
    console.log('GeoIP Lookup Result:', geo); 

    let location = 'Unknown';
    if (geo && geo.city) {
      location = geo.city;
    } else {
      
      location = 'New York';
    }

    const weatherApiKey = '47d0a505327d690ea418623e655afa86'; 
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=metric`;

    console.log('Fetching weather data from:', weatherApiUrl);

    const weatherResponse = await fetch(weatherApiUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      console.error('Weather API request failed:', weatherData);
      return res.status(500).json({ error: 'Weather API request failed' });
    }

    const temperature = weatherData.main.temp;

    const response = {
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    };

    res.json(response);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



