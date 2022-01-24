module.exports = {
    name: "Flareworm",
    desc: "A type of earth worm commonly find in Ember Rift. It's slight radiating heat attracts more fish.",
    effect: "Increases chance to catch fish by 15%",
    price: 6,
    updateStats(statObject) { 
        statObject.fishChance += 0.15;
        statObject.fishChanceText += `Flareworm: +15%\n`;
    }
}