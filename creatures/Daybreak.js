module.exports = {
    name: "Daybreak",
    desc: "",
    requirements: "Between 4am and 7am",
    price: 0,
    hatchTime: 12 * 60 * 60 * 1000,
    weight: (client, user) => Date.nowWA().betweenHours(4, 7) ? 0.15 : 0
}