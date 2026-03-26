const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");

dotenv.config()

const orders = JSON.parse(fs.readFileSync("orders.json", "utf-8"));

const API_KEY = process.env.OPENWEATHER_API_KEY;


async function fetchWeather(city) {
  try {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    return { city, weather: res.data.weather[0].main };
  } catch (error) {
    console.error(`Error fetching weather for ${city}`);
    return { city, error: true };
  }
}


function generateApology(name, city, weather) {
  return `Hi ${name}, your order to ${city} is delayed due to ${weather}. We appreciate your patience!`;
}


async function processOrders() {

  const weatherResults = await Promise.all(
    orders.map(order => fetchWeather(order.city))
  );

  console.log(weatherResults)


  orders.forEach((order, index) => {
    const result = weatherResults[index];

    if (result.error) return;

    const badWeather = ["Smoke", "Snow", "Extreme"];

    if (badWeather.includes(result.weather)) {
      order.status = "Delayed";
      order.message = generateApology(
        order.customer,
        order.city,
        result.weather
      );
    }
  });

  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));

  console.log("Orders processed successfully!");
}

processOrders();