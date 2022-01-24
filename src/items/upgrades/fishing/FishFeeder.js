module.exports = {
    name: "Fish Feeder",
    desc: "Set up automatic fish feeders to draw more fish into your location. Has a side effect of growing some real chonky bois.",
    effect: "Increase chance to catch fish by 2%",
    price: 2000,
    max: 5,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.fishChance += 0.02* amount;
        statObject.fishChanceText +=  `Fish Feeder: +${0.02 * amount * 100}%\n`;
    }
}