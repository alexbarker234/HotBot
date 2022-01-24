module.exports = {
    name: "Gleap Jelly Sandwich",
    desc: "A delicious culinary masterpiece crafted from the rare jelly obtained from Gleaps. A favourite snack of many creatures, but try not to eat it yourself.",
    effect: "Increases catch chance by 30%",
    price: 5000,
    duration: 60 * 60 * 1000,
    cantSell: true,
    updateStats(statObject) { 
        if (statObject.eggChance < 0.4) {
            statObject.eggChance = 0.4;
            statObject.eggChanceText += `Gleap Jelly Sandwich: +30%\n`;
        }
    }
}