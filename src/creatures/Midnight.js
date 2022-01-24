module.exports = {
    name: "Midnight",
    desc: "A shy creature that only appears around midnight. It's appetite is enormous and requires constant feeding. It also likes cooking its food with its flamelash tail.\nSome people believe that Midnights are a cousin of the Volcanine due to their similar flaming tails.",
    requirements: "Between 11pm and 1am",
    price: 0,
    hatchTime: 24 * 60 * 60 * 1000,
    weight: (client, user) => Date.nowWA().betweenHours(23, 1) ? 0.1 : 0
}