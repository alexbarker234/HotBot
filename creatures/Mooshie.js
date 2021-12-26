const functions = require('../functions.js')
module.exports = {
    name: "Mooshie",
    desc: "Mooshies are peculiar little fungus creatures that spontaneously appear during the rain. No one has ever seen a mooshie approach, they seemingly pop into existance when you arent looking. Because of their strange properties, some religious groups believe mooshies to be a path to the In Between- a reality between the dead and the alive. The devout believers often hunt mooshies and eat them. They are poisonous.",
    requirements: "Rain",
    price: 0,
    hatchTime: 5 * 60 * 60 * 1000,
    weight: (client, user) => functions.isRaining(client, user) ? 0.6 : 0
}
