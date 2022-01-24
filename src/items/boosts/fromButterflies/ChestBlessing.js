module.exports = {
    name: "Blessing of the Pirate",
    desc: "The butterfly grants you supernatural treasure hunting abilities.",
    effect: "Increases chance to find a chest by 10%",
    price: 1000,
    duration: 5 * 60 * 1000,
    cantSell: true,
    cantBuy: true,
    updateStats(statObject) { 
        statObject.chestChance += 0.1;
        statObject.chestChanceText += `Blessing of the Pirate: +10%\n`;
    }
}