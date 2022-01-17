module.exports = {
    name: "Starbell",
    desc: "A very juicy fruit that grows in tropical climates. It is not commonly found in the Ember Rift due to its dryness and is often imported.",
    plantedEffect: "Decreases water need for all plants by 10%. **HOWEVER** planting more than one Starbell will increase water rate drastically",
    price: 300,
    waterRate: 12 * 60 * 60 * 1000,
    plantYield: 25,
    growTime: 10 * 24 * 60 * 60 * 1000,
    cantBuy: true,
    updateStats(statObject, amount) {
        if (amount > 1) {
            statObject.gardenWaterNeed += 1 * amount;
            statObject.gardenWaterNeedText +=  `Starbell: +${1 * amount * 100}%\n`;
        }
        else {
            statObject.gardenWaterNeed -= 0.1;
            statObject.gardenWaterNeedText += `Starbell: -10%\n`;
        }
    }
}