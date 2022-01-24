const config = require(global.appRoot + "/config.json");

module.exports = {
    name: "Gobby Scythe",
    desc: "A tool commonly used by Gobby farmers to increase farming efficiency",
    effect: "Increases your garden plots by +1",
    price: 10000,
    max: 2,
    cantSell: true,
    hideInShop: true,
    buyRequirements: () => Date.nowWA().getDay() == config.gobbyTraderDay,
    updateStats(statObject, amount) { 
        statObject.gardenPlots += amount;
        statObject.gardenPlotsText +=  `Gobby Scythe: +${amount}\n`;
    }
}