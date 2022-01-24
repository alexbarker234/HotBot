module.exports = {
    name: "Steelshell",
    desc: "A small shellfish that is not very tasty, but it's magnetic properties can be exploited to find metallic objects underwater",
    effect: "Increases chance to get a chest by 5%, but reduces the chance to get fish by 10%",
    price: 12,
    updateStats(statObject) { 
        statObject.fishChance -= 0.1;
        statObject.fishChanceText += `Steelshell: -10%\n`;
        statObject.chestChance += 0.05;
        statObject.chestChanceText += `Steelshell: +5%\n`;
    }
}