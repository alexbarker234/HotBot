module.exports = {
    name: "Psychic Pulser",
    desc: "A device that emits a pleasant psychic pulse, causing all creatures to be drawn to the origin",
    effect: "Increases catch chance by 10%",
    price: 1000,
    duration: 3 * 60 * 60 * 1000,
    cantSell: true,
    updateStats(statObject) { 
        if (statObject.eggChance < 0.2) {
            statObject.eggChance = 0.2;
            statObject.eggChanceText += `Psychic Pulser: +10%\n`;
        }
    }
}