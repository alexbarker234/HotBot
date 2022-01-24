module.exports = {
    name: "Fertilizer",
    desc: "Increase the nutrition contained in the soil allowing plants to grow faster.",
    effect: "Increases growth rate by 2%",
    price: 1500,
    max: 10,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.gardenGrowthRate += 0.02 * amount;
        statObject.gardenGrowthRateText +=  `Fertilizer: +${0.02 * amount * 100}%\n`;
    }
}