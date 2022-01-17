module.exports = {
    name: "Ashdrake",
    desc: "A sentient plant used in very powerful magical potions. However, it sucks water from neighbouring plants and one plant does not yield very many Ashdrakes",
    plantedEffect: "Increases all plants water need by 20%",
    price: 500,
    waterRate: 20 * 60 * 60 * 1000,
    plantYield: 3,
    growTime: 5 * 24 * 60 * 60 * 1000,
    cantBuy: true,
    updateStats(statObject, amount) { 
        statObject.gardenWaterNeed += 0.2 * amount;
        statObject.gardenWaterNeedText +=  `Ashdrake: +${0.2 * amount * 100}%\n`;
    }
}