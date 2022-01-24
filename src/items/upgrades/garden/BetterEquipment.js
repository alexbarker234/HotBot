module.exports = {
    name: "Better Equipment",
    desc: "Some better tools, allowing you to till more plots",
    effect: "Increases your garden plots by +1",
    price: 5000,
    max: 2,
    cantSell: true,
    updateStats(statObject, amount) { 
        statObject.gardenPlots += amount;
        statObject.gardenPlotsText +=  `Better Equipment: +${amount}\n`;
    }
}