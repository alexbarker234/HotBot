module.exports = {
    name: "Boombox",
    desc: "The rumbling bass of the boombox distracts nearby creatures, allowing you to capture their eggs with ease.",
    effect: "Decreases the egg roll cooldown by 1 minute",
    price: 1000,
    duration: 1 * 60 * 60 * 1000,
    cantSell: true,
    updateStats(statObject) { 
        if (statObject.eggCD > 4) {
            statObject.eggCD = 4;
            statObject.eggCDText += `Boombox: -1m\n`;
        }
    }
}