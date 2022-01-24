module.exports = {
    name: "Toxicane",
    desc: "A rare plant that takes years to fully grow. The deeper sea creatures love this stuff, but it is toxic to humans.",
    effect: "Increases the chance to get rare fish, and increases fish chance by 10%",
    price: 15,
    updateStats(statObject) { 
        statObject.fishChance += 0.1;
        statObject.fishChanceText += `Toxicane: +10%\n`;

        statObject.rareFishScale += 0.7;
        statObject.rareFishScaleText += `Toxicane: +70%\n`;
    }
}