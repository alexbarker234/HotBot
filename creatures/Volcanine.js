module.exports = {
    name: "Volcanine",
    desc: "Volcanines are docile dog-like creatures that make their homes near volcano hotspots, preying on smaller creatures while leaving anything bigger than it alone. Volcanines are pack hunters and can be seen in groups of up to 15. Despite their large and intimidating figure, they love to play fetch, sometimes with unsuspecting obbys. They hate temperatures under 20C and will migrate to hotter climates until the temperature raises again.",
    requirements: "Weather above 20C",
    price: 0,
    hatchTime: 5 * 60 * 60 * 1000,
    weight: (client, user) => client.weatherCache.temperature > 20 ? 0.5 : 0
}