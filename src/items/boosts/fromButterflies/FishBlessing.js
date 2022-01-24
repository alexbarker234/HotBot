module.exports = {
    name: "Blessing of the Shark",
    desc: "The butterfly grants you supernatural fishing abilities.",
    effect: "Increases chance to catch fish by 30%",
    price: 1000,
    duration: 10 * 60 * 1000,
    cantSell: true,
    cantBuy: true,
    updateStats(statObject) { 
        statObject.fishChance += 0.3;
        statObject.fishChanceText += `Blessing of the Shark: +30%\n`;
    }
}