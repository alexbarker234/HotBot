module.exports = {
    name: "Sprinkler",
    desc: "Install some sprinklers to automatically water your garden.",
    effect: "Decreases the frequency you need to water your garden by 10%",
    price: 1500,
    max: 5,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.gardenWaterNeed -= 0.1 * amount;
        statObject.gardenWaterNeedText +=  `Sprinkler: -${0.1 * amount * 100}%\n`;
    }
}