module.exports = {
    name: "Smokelancer",
    desc: "A distant cousin of octopi, shrouding itself in a constant stream of smoke allowing it's true form to remain unknown. Despite this, its still a piddly little thing that fish treat as a delicacy.",
    effect: "Increases fish chance by 40%, but removes chance to get a chest",
    price: 13,
    updateStats(statObject) { 
        statObject.fishChance += 0.4;
        statObject.fishChanceText += `Smokelancer: +40%\n`;
        statObject.chestChance = 0;
        statObject.chestChanceText += `Smokelancer: 0%\n`;
    }
}