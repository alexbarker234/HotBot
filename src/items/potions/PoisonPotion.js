const config = require(global.appRoot + '/config.json');

module.exports = {
    name: "Poison Potion",
    desc: "",
    effect: "Increases chance to get rare fish",
    steps: "add 1 Toxeel-cool-mix-add 2 Starlight Spud-stir-boiling",
    price: 750,
    duration: 6 * 60 * 60 * 1000,
    cantBuy: true,
    consumable: true,
    updateStats(statObject) { 
        if (statObject.rareFishScale < 0.4) {
            statObject.rareFishScale = 0.4;
            statObject.rareFishScaleText += `Poison Potion: +40%\n`;
        }
    }
}