const functions = require('../functions.js')
module.exports = {
    name: "Skylin",
    desc: "",
    requirements: "Raining and above 20km/h winds",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    weight: (client, user) => (functions.isRaining(client, user) && client.weatherCache.windspd * 3.6 > 20) ? 0.6 : 0
}