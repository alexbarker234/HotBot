module.exports = {
    name: "Ancient Gloves",
    desc: "Some very old gloves that have been sealed away for a long time. They are imbued with some magic to allow you to garden more efficiently",
    effect: "Increases your garden plots by +1",
    price: 0,
    max: 2,
    cantSell: true,
    cantBuy: true,
    updateStats(statObject, amount) { 
        statObject.gardenPlots += amount;
        statObject.gardenPlotsText +=  `Ancient Gloves: +${amount}\n`;
    }
}