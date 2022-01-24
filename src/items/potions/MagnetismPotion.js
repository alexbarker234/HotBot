const config = require(global.appRoot + '/config.json');

module.exports = {
    name: "Magnetism Potion",
    desc: "",
    effect: "Increases chest chance by 10% but removes the chance to get a fish",
    steps: "hot-add 5 Coalsprout-stir-add 8 Searcap-boiling",
    price: 750,
    duration: 10 * 60 * 1000,
    cantBuy: true,
    consumable: true,
    updateStats(statObject) { 
        if (statObject.chestChance < config.chestChance + 0.1) {
            statObject.fishChance = 0;
            statObject.fishChanceText += `Magnetism Potion: 0%\n`;
            statObject.chestChance = config.chestChance + 0.1;
            statObject.chestChanceText += `Magnetism Potion: +10%\n`;
        }
    }
}