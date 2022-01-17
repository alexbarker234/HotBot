const config = require("./config.json");
const functions = require("./functions.js");
const plantSchema = require('./models/plantSchema');


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

var calculateWaterRate = exports.calculateWaterRate = (userStats, plantData) => {
    if (!plantData) return 0;
    let waterMultiplier = 1 + (1 - userStats.gardenWaterNeed);
    return plantData.waterRate * waterMultiplier;
}
exports.calculateWaterPercent = (plant, userStats, plantData) => {
    if (!plantData) return 0;
    return Math.clamp(1 - ((Date.now() - plant.lastWatered.getTime()) / calculateWaterRate(userStats, plantData)), 0, 1)
}
var calculateGrowTime = exports.calculateGrowTime = (userStats, plantData) => {
    if (!plantData) return 0;
    let growTimeMultiplier = 1 - (userStats.gardenGrowthRate - 1);
    return plantData.growTime * growTimeMultiplier;
}
exports.calculateGrowthPercent = (plant, userStats, plantData) => {
    if (!plantData) return 0;
    return Math.clamp((((Date.now() - plant.planted) - plant.timeUnwatered + plant.growthOffset) / calculateGrowTime(userStats, plantData)), 0, 1)
}

exports.fixDefaultGarden = (user) => {
    for (let i = 0; i < 8; i++) {
        var plant = user.garden.plants[i];
         // if there is no object
        if (!plant) 
            user.garden.plants.push(plantSchema);
        else {
            // fix values that should be defined
            for (const [key, value] of Object.entries(plantSchema.paths)) {
                if (key == "_id") continue;
                if (value.defaultValue != undefined && plant[key] == undefined) {
                    plant[key] = value.defaultValue;
                }
            }
        }
    }
}