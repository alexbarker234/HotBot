module.exports = {
    name: "Smold",
    desc: "",
    requirements: "Above 25km/h winds",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    weight: (client, user) => client.weatherCache.windspd * 3.6 > 25 ? 0.4 : 0
}