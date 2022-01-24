module.exports = {
    name: "Hatchery Remodel",
    desc: "Expand your hatchery, allowing for another egg. Also comes with heating!",
    effect: "Allows you to have up to 4 eggs in your hatchery",
    price: 15000,
    max: 1,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.eggSlots++;
        statObject.eggSlotsText +=  `Hatchery Remodel: +${1 * amount}\n`;
    }
}