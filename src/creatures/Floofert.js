module.exports = {
    name: "Floofert",
    desc: "Flooferts are very fluffy creatures, capable of surviving much harsher colds than a lot of the other creatures. Despite their sheep like characteristics, they rarely grow larger than a chihuahua due to their very slow aging. Flooferts can live upwards of 500 years, but people often mistake them as babies because of their size. If you pick up a floofert and look into its eyes, you can hear their thoughts. It's silence.",
    requirements: "Under 20C. More common under 10C",
    price: 0,
    hatchTime: 8 * 60 * 60 * 1000,
    weight: (client,user) => client.weatherCache.temperature < 20 ? client.weatherCache.temperature < 10 ? 0.6 : 0.3 : 0
}