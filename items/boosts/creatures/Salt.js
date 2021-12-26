module.exports = {
    name: "Salt",
    desc: "Due to the similarity in bleaps physiology to slugs, salt is an effective way to ward them away.",
    effect: "Decreases the chance to catch bleaps",
    price: 500,
    duration: 6 * 60 * 60 * 1000,
    cantSell: true,
    updateStats(statObject) { 
        statObject.eggWeightScales.set("Bleap", 0.5);
    }
}