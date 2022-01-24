const config = require(global.appRoot + '/config.json');

module.exports = {
    name: "Pheromone Potion",
    desc: "",
    effect: "Increases egg find chance by 10%",
    steps: "add 3 Ashjelly-lukewarm-beat-add 10 Gasbloom-stir",
    price: 750,
    duration: 6 * 60 * 60 * 1000,
    cantBuy: true,
    consumable: true,
    updateStats(statObject) { 
        if (statObject.eggChance < config.eggChance + 0.1) {
            statObject.eggChance = config.eggChance + 0.1;
            statObject.eggChanceText += `Pheromone Potion: +10%\n`;
        }
    }
}