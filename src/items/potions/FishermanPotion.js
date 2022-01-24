const config = require(global.appRoot + '/config.json');

module.exports = {
    name: "Potion of the Fisherman",
    desc: "",
    effect: "Increases chance to catch a fish by 5%",
    steps: "add 2 Goldie-boiling-add 3 Sparkweed-beat",
    price: 250,
    duration: 6 * 60 * 60 * 1000,
    cantBuy: true,
    consumable: true,
    updateStats(statObject) { 
        if (statObject.fishChance < config.fishChance + 0.05) {
            statObject.fishChance = config.fishChance + 0.05;
            statObject.fishChanceText += `Potion of the Fisherman: +5%\n`;
        }
    }
}