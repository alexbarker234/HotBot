const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: "Thermaline",
    desc: "",
    requirements: "Raining and above 15C",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    weight: (client, user) => (functions.isRaining(client, user) && client.weatherCache.temperature > 15) ? 0.8 : 0
}