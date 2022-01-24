module.exports = {
    name: "Orbide",
    desc: "A small meaty morsel, baffling how it even exists. Scientists argue whether it is even a living creature.",
    effect: "Increases chance to catch fish by 10%",
    price: 3,
    cantBuy: true,
    updateStats(statObject) { 
        statObject.fishChance += 0.10;
        statObject.fishChanceText += `Orbide: +10%\n`;
    }
}