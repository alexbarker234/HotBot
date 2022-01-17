const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const functions = require("./functions.js");

exports.chooseFish = (client, rarityInfluence) => {
    availableFish = [];

    for (const [name, fish] of client.fish) {
        if (fish.available()) availableFish.push(fish);
    }

    if (!rarityInfluence) rarityInfluence = 0;

    if (availableFish.length == 0) { console.log("no fish available"); return; }

    // make rare fish more common, common fish more rare
    let scaledWeighting = new Map()
    let weightSum = 0.0;
    for (const fish of availableFish) weightSum += fish.rarity();
    averageWeight = weightSum / availableFish.length;

    for (const fish of availableFish) {
        scaledWeighting.set(fish.name, fish.rarity() + (averageWeight - fish.rarity()) * rarityInfluence)
    }

    let rand = Math.random() * weightSum;
    for (const fish of availableFish) {
        if (rand <= scaledWeighting.get(fish.name)) return fish;
        rand -= scaledWeighting.get(fish.name);
    }
    console.log('error picking fish');
    return null; // should never happen lmao but you know OrangeCode™
}


exports.chooseChestRewards = async (client, user, addToUser) => {
    const userStats = await functions.getUserStats(client, user.userID, user.guildID);

    let chestRewards = [];
    let chestTier = "";
    let flarinReward = 0;

    seeds = new Map();
    seeds.set("Searcap Seeds", 0.6);
    seeds.set("Gasbloom Seeds", 0.6);
    seeds.set("Starlight Spud Seeds", 0.3);
    seeds.set("Scorchbean Seeds", 0.1);
    seeds = functions.weightScale(seeds, userStats.chestMultiplier - 1)

    baitOptions = new Map();
    baitOptions.set("Orbide", 1.2);
    baitOptions.set("Flareworm", 0.6);
    baitOptions.set("Bloodleech", 0.3);
    baitOptions.set("Steelshell", 0.2);
    baitOptions.set("Smokelancer", 0.1);
    baitOptions.set("Toxicane", 0.1);
    baitOptions = functions.weightScale(baitOptions, userStats.chestMultiplier - 1)

    let min = 1;
    let max = 6;
    let target = min + ((max- min) * (userStats.chestMultiplier- 1))
    let numRewards = Math.floor(Math.biasedRand(min, max, 1, target)) // 1-5 rewards, more likely to get less
    if (numRewards > 3) chestTier = "Rare";
    //console.log("chest rewards: "+ numRewards);
    for (let i = 0; i < numRewards; i++) {
        let rand = Math.floor(Math.random() * 3);
        if (rand == 0) {
            let seedChoice = functions.pickFromWeightedMap(seeds);
            if (!client.seeds.get(seedChoice)) { console.log(`chest seed ${seedChoice} doesnt exist`); continue; }
            functions.addThingToUser(chestRewards, seedChoice, 1) // not adding to user, just adding to array
            if (addToUser) functions.addThingToUser(user.inventory.seeds, seedChoice, 1);
        }
        else if (rand == 1) {
            let baitChoice = functions.pickFromWeightedMap(baitOptions);
            if (!client.bait.get(baitChoice)) { console.log(`chest bait ${baitChoice} doesnt exist`); continue; }
            let baitNum = Math.floor(Math.biasedRand(5, 30, 15, 0.8));
            functions.addThingToUser(chestRewards, baitChoice, baitNum)
            if (addToUser) functions.addThingToUser(user.inventory.bait, baitChoice, baitNum);
        }
        else if (rand == 2) {
            flarinReward += Math.floor(Math.biasedRand(10, 500, 50, 1.5));
            if (addToUser) user.flarins += flarinReward;
        }
    }
    // 1/25 chance to get an upgrade - about every 500 fishes
    if (Math.random() < 1.0 / 25.0) {
        console.log(`${user.userID} just got an upgrade!`)
        chestTier = "Mythic";

        let upgradeData = functions.getItem(client, "Ancient Gloves");
        if (!upgradeData) return console.log(`error getting ${upgrade.name} data`)

        if (functions.getUpgradeCount(user, "Ancient Gloves") < upgradeData.max) {
            functions.addThingToUser(chestRewards, "Ancient Gloves", 1)
            if (addToUser) functions.addThingToUser(user.upgrades, "Ancient Gloves", 1);
        }
    }
    return { chestRewards: chestRewards, chestTier: chestTier, flarinReward: flarinReward };
}

/*
function chooseFish(client, rarityInfluence){
    availableFish = [];
    
    for (const [name, fish] of client.fish) {
        if (fish.available()) availableFish.push(fish);
    }

    if (!rarityInfluence) rarityInfluence = 0;

    if (availableFish.length == 0) { console.log("no fish available"); return; }

    let weightSum = 0.0;
    for (const fish of availableFish) weightSum += fish.rarity();
    let rand = Math.random() * weightSum; 
    for (const fish of availableFish)
    {
        if (rand <= fish.rarity()) return fish;
        rand -= fish.rarity(); // subtract the weight so the total is only the sum of remaining options
    }
    console.log('error picking fish');
    return null; // should never happen lmao but you know OrangeCode™
}
*/
