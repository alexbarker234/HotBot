const config = require("./config.json");
const functions = require("./functions.js");


var updatePlantWater = exports.updatePlantWater = async (client, user, plant) => {
    let plantData = client.plants.get(plant.name);
    if (!plantData) return console.log(`error getting ${plant.name} data`);

    const userStats = await functions.getUserStats(client, user.userID, user.guildID);

    let waterRate = plantData.waterRate * (1 + (1 - userStats.gardenWaterNeed));

    //console.log(`updating ${user.userID}'s ${plant.name}`);

    if (Date.now() - plant.lastWatered.getTime() > waterRate) {
        let difference = 0;
        if (plant.lastWatered.getTime() >= plant.lastUnwateredUpdate.getTime())
            difference = plant.lastWatered.getTime() + waterRate;
        else
            difference = plant.lastUnwateredUpdate.getTime();
        //creatureUserModel.update({}, {$inc: {timeUnwatered: Date.now() - difference}})
        plant.timeUnwatered += Date.now() - difference;
        plant.lastUnwateredUpdate = new Date();
        if (plant.timeUnwatered > config.plantDeathTime) {
            if (user.settings.notifs && user.settings.witherNotifs) functions.sendAlert(client, `<@!${user.userID}>! your ${plant.name} has withered! :(`, user.guildID)
            Object.assign(plant, { name: "none", planted: null, lastWatered: null, timeUnwatered: 0, lastUnwateredUpdate: 0 });
        }
    }
}

exports.calculateWaterPercent = (plant, userStats, plantData) => {
    let waterMultiplier = 1 + (1 - userStats.gardenWaterNeed);
    return Math.clamp(1 - ((Date.now() - plant.lastWatered.getTime()) / (plantData.waterRate * waterMultiplier)), 0, 1)
}
exports.calculateGrowthPercent = (plant, userStats, plantData) => {
    let growthMultiplier = 1 - (userStats.gardenGrowthRate - 1);
    return Math.clamp(((((Date.now() - plant.planted) - plant.timeUnwatered) * growthMultiplier) / plantData.growTime), 0, 1)
}

exports.fixDefaultGarden = (user) => {
    if (user.garden.plants.length == 0) {
        for (let i = 0; i < 8; i++) user.garden.plants.push({ name: "none", planted: null, lastWatered: null, timeUnwatered: 0, lastUnwateredUpdate: new Date() });
    }
}