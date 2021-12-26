const functions = require('../functions.js')

module.exports = {
    name: "Gorb",
    desc: "Gorbs are derpy little frogs that normally hunt emberflys. Due to their solitary nature, they are often preyed on by bleaps. The bleaps are actually herbiverous but are just bastards causing pain to lone gorbs. Gorbs have a tough slimey grey skin that is able to insulate them from immense heat, allowing them to explore the cavernous interior of volcanoes where emberfly nests are common. They burrow themselves at night, so they are never found outside of daytime.",
    requirements: "Between 8am-8pm. More common during rain",
    price: 0,
    hatchTime: 3 * 60 * 60 * 1000,
    weight: (client, user) => Date.nowWA().betweenHours(8,20) ? (functions.isRaining(client, user) ? 0.8 : 0.4) : 0
}