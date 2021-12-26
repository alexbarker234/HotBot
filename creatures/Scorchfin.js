module.exports = {
    name: "Scorchfin",
    desc: "",
    requirements: "Weekend, under 30C",
    price: 0,
    hatchTime: 6 * 60 * 60 * 1000,
    weight: (client, user) => {
        const time = Date.nowWA();
        return ((time.getDay() == 6 || time.getDay() == 0) && client.weatherCache.temperature < 30) ? 0.25 : 0;    
    }
}