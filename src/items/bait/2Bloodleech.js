module.exports = {
    name: "Bloodleech",
    desc: "A nasty little parasite that clings onto anything it can find",
    effect: "Gives a chance to catch a bonus fish",
    price: 8,
    updateStats(statObject) { 
        statObject.bonusFishChance += 0.7;
        statObject.bonusFishChanceText += `Bloodleech: +70%\n`;
    }
}