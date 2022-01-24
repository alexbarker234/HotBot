const { MessageEmbed } = require('discord.js');
const creatureUserModel = require(global.src + '/models/creatureUserSchema');
const guildSettingsModel = require(global.src + '/models/guildSettingsSchema');
const warehouses = ['907483410258337803', '907492571503292457', '862206016510361600', '917654307648708609']
const config = require(global.appRoot + '/config.json');;
const seedrandom = require('seedrandom');
const fs = require('fs');

exports.getUser = async (userID, guildID) => {
    let user;
    try { user = await creatureUserModel.findOne({ userID: userID, guildID: guildID }); }
    catch (err) { console.error(err); }
    return user;
}

exports.getGuild = async (guildID) => {
    let guild;
    try {
        guild = await guildSettingsModel.findOne({ guildID: guildID });
        // create profile if it doesnt exist
        if (!guild)
            guild = await guildSettingsModel.create({ guildID: guildID });
    }
    catch (err) { console.error(err); }
    return guild;
}

exports.managePlanReactions = async (reaction) => {
    let can = '';
    let cant = '';
    let maybe = '';

    for await (const [react, reactValue] of reaction.message.reactions.cache) {
        const users = await reactValue.users.fetch();
        for await (const [user, userValue] of users) {
            if (!userValue.bot) {
                if (react == '👍') can += userValue.toString() + "\n";
                else if (react == '👎') cant += userValue.toString() + "\n";
                else if (react == '🤷') maybe += userValue.toString() + "\n";
            }
        }
    }

    if (can == '') can = 'no one :(';
    if (cant == '') cant = 'no one :)';
    if (maybe == '') maybe = 'no one :)';

    console.log("updated availabilities on: " + reaction.message.id)

    const oldEmbed = reaction.message.embeds[0];
    const embed = new MessageEmbed()
        .setColor(oldEmbed.color)
        .setTitle(oldEmbed.title)
        .addField("can go", can, true)
        .addField("can't go", cant, true)
        .addField("perhaps", maybe, true)
        .setFooter("id: " + reaction.message.id)
    await reaction.message.edit({ embeds: [embed] });
}

// this feels like the worst way to do this lmao
var getUserStats = exports.getUserStats = async (client, userID, guildID) => {

    let statObject = {
        eggChance: config.eggChance, eggChanceText: `Base ${config.eggChance * 100}%\n`,
        eggCD: config.eggMsgCD, eggCDText: `Base ${config.eggMsgCD} minutes\n`,
        eggSlots: 3, eggSlotsText: "Base 3\n",
        eggHatchSpeed: 1, eggHatchSpeedText: "Base 100%\n",

        eggWeightScales: new Map(), eggWeightScalesText: "Base 100%\n",

        fishChance: config.fishChance, fishChanceText: `Base ${config.fishChance * 100}%\n`,
        bonusFishChance: 0, bonusFishChanceText: `Base 0%\n`,
        rareFishScale: 0, rareFishScaleText: `Base 0%\n`,
        chestChance: config.chestChance, chestChanceText: `Base ${config.chestChance * 100}%\n`,
        artifactChance: config.artifactChance, artifactChanceText: `Base ${config.artifactChance * 100}%\n`,
        chestMultiplier: 1, chestMultiplierText: `Base 100%\n`,

        butterflyMultiplier: 1, butterflyMultiplierText: `Base 100%\n`,

        gardenPlots: 2, gardenPlotsText: `Base 3\n`,
        gardenGrowthRate: 1, gardenGrowthRateText: `Base 100%\n`,
        gardenWaterNeed: 1, gardenWaterNeedText: `Base 100%\n`
    };
    if (userID == '283182274474672128') {
        //statObject.chestChance = 0.7;
        //statObject.eggCD = 0;
        //statObject.eggChance = 1;
    }

    const filter = { userID: userID, guildID: guildID }
    let user = await creatureUserModel.findOne(filter);
    if (!user) {
        console.error("error getting profile for stats");
        return statObject;
    }
    clearFinishedBoosts(client, user);

    // boooosts
    for (const boost of user.boosts) {
        let boostData = client.boosts.get(boost.name);
        if (!boostData) boostData = client.potions.get(boost.name);
        if (!boostData) { console.error(`couldnt find ${boost.name} data`); continue; }
        if (Date.now() - boost.used < boostData.duration) {
            boostData.updateStats(statObject);
        }
    }
    // upgrades
    for (const upgrade of user.upgrades) {
        let upgradeData = client.upgrades.get(upgrade.name);
        if (!upgradeData) { console.error(`couldnt find ${upgrade.name} data`); continue; }
        upgradeData.updateStats(statObject, upgrade.count);
    }
    // garden

    let plantEffects = new Map();
    for (const plant of user.garden.plants) {
        if (plant.name == "none") continue;
        let plantData = client.plants.get(plant.name);
        if (!plantData) { console.error(`couldnt find ${plant.name} data`); continue; }
        if (plantData.updateStats) {
            let mapEntry = plantEffects.get(plantData.name)
            if (mapEntry) plantEffects.set(plantData.name, mapEntry + 1)
            else plantEffects.set(plantData.name, 1)
        }
    }
    for (const [name, amount] of plantEffects) {
        let plantData = client.plants.get(name);
        if (!plantData) { console.error(`couldnt find ${name} data`); continue; }
        plantData.updateStats(statObject, amount);
    }


    // bait
    let bait = user.baitEquipped;
    if (!bait) bait = "none";
    if (bait != "none") {
        let baitData = client.bait.get(bait);
        if (baitData) baitData.updateStats(statObject);
        else console.error(`couldnt find ${bait}`)
    }

    // hotness
    let hotnessEffect = (getHotness(userID) - 10) / 100;
    if (hotnessEffect != 0) {
        statObject.eggChance += hotnessEffect;
        statObject.eggChanceText += `hotness: ${hotnessEffect * 100}%\n`;
    }
    //user.save(); // save cleared boosts
    return statObject;
}

var userHasBoost = exports.userHasBoost = (user, boostName) => {
    for (const boost of user.boosts) {
        if (boost.name == boostName) return true;
    }
    return false;
}
var userHasUpgrade = exports.userHasUpgrade = (user, upgradeName) => {
    for (const upgrade of user.upgrades) {
        if (upgrade.name == upgradeName) return true;
    }
    return false;
}

var userItemCount = exports.userItemCount = (user, itemName) => {
    for (const [key, value] of Object.entries(user.inventory)) {
        for (const item of user.inventory[key]) {
            if (item.name == itemName) return item.count;
        }
    }
    return 0;
}
var userCreatureCount = exports.userCreatureCount = (user, creatureName) => {
    for (const creature of user.creatures) {
        if (creature.name == creatureName) return creature.count;
    }
    return 0;
}
var weightScale = exports.weightScale = (map, influence) => {
    let weightSum = 0;
    for (const [key, value] of map) weightSum += value;
    let averageWeight = weightSum / map.size;

    let scaledWeighting = new Map()
    for (const [key, value] of map) {
        scaledWeighting.set(key, value + (averageWeight - value) * influence)
    }
    return scaledWeighting;
}

exports.chooseButterflyRewards = async (client, user, addToUser) => {
    const userStats = await getUserStats(client, user.userID, user.guildID);

    if (addToUser === undefined) addToUser = true;
    let itemRewards = [];
    let boostRewards = [];

    let seeds = new Map();
    seeds.set("Gasbloom Seeds", 0.5);
    seeds.set("Sparklethorn Seeds", 0.4);
    seeds.set("Ashdrake Seeds", 0.3);
    seeds = weightScale(seeds, userStats.butterflyMultiplier - 1)

    let baitOptions = new Map();
    baitOptions.set("Orbide", 0.8);
    baitOptions.set("Flareworm", 0.6);
    baitOptions.set("Bloodleech", 0.3);
    baitOptions = weightScale(baitOptions, userStats.butterflyMultiplier - 1)

    let min = 2;
    let max = 6;
    let target = min + ((max - min) * (userStats.butterflyMultiplier - 1))
    let numRewards = Math.floor(Math.biasedRand(min, max, 1.3, target)) // 2-5 rewards, more likely to get less    
    for (let i = 0; i < numRewards; i++) {
        let rand = Math.floor(Math.random() * 2);
        if (rand == 0) {
            let seedChoice = pickFromWeightedMap(seeds);
            if (!client.seeds.get(seedChoice)) { console.logger.warn(`butterfly seed ${seedChoice} doesnt exist`); continue; }

            addThingToUser(itemRewards, seedChoice, 1) // not adding to user, just adding to array
            if (addToUser) addThingToUser(user.inventory.seeds, seedChoice, 1);
        }
        else if (rand == 1) {
            let baitChoice = pickFromWeightedMap(baitOptions);
            if (!client.bait.get(baitChoice)) { console.logger.warn(`butterfly bait ${baitChoice} doesnt exist`); continue; }
            let baitNum = Math.floor(Math.biasedRand(5, 30, 15, 0.8));

            addThingToUser(itemRewards, baitChoice, baitNum)
            if (addToUser) addThingToUser(user.inventory.bait, baitChoice, baitNum);
        }
    }
    // boosts
    if (Math.random() < 0.2) {
        let rand = Math.floor(Math.random() * 3);
        if (rand == 0) {
            addThingToUser(boostRewards, "Blessing of the Pirate", 1)
            if (addToUser) addBoost(client, user, "Blessing of the Pirate");
        }
        else if (rand == 1) {
            addThingToUser(boostRewards, "Blessing of the Shark", 1)
            if (addToUser) addBoost(client, user, "Blessing of the Shark");
        }
        else if (rand == 2) {
            addThingToUser(boostRewards, "Blessing of the Dryad", 1)
            if (addToUser) {
                user.garden.plants.forEach(async (plant) => {
                    let plantData = await client.plants.get(plant.name);
                    if (plantData) { console.log(plantData.growTime * 0.1); plant.growthOffset += plantData.growTime * 0.1; }
                });
            }
        }
    }

    let dustReward = Math.floor(Math.biasedRand(1, 50, 10, 1.5));
    addThingToUser(itemRewards, "Butterfly Dust", dustReward);
    if (addToUser) addThingToUser(user.inventory.misc, "Butterfly Dust", dustReward);

    return { itemRewards: itemRewards, boostRewards: boostRewards };
}

exports.isRaining = (client, user) => {
    let rainCaster = false;
    if (user) rainCaster = userHasBoost(user, "Raincaster");
    return client.weatherCache.weather == "Rain" || client.weatherCache.weather == "Drizzle" || rainCaster;
}

exports.getUpgradeCount = (user, upgradeName) => {
    for (const upgrade of user.upgrades)
        if (upgrade.name == upgradeName) return upgrade.count;
    return 0;
}

var getHotness = exports.getHotness = (userID, prevDay) => {
    let dateObj = Date.nowWA();
    if (prevDay) dateObj = Date.parseWADate(prevDay);

    let day = dateObj.getTime() / 86400000;

    var rng = seedrandom(userID + day); // id + days since epoch
    var max = 13;
    var min = 7;

    return Math.floor(rng() * (max - min) + min);
}

exports.getItem = (client, nameToFind) => {
    for (const itemType of client.items)
        for (const [itemName, item] of client[itemType])
            if (item.name == nameToFind) return item;
}

let emojiCache = new Map();
exports.getEmojiFromName = (client, name, fallback) => {
    name = name.split(' ').join(''); // replace only removes the first occurance without regex for some reason
    let emojiFromCache = emojiCache.get(name);
    if (emojiFromCache) return emojiFromCache;

    let emojiToReturn;
    for (const [id, emoji] of client.emojis.cache) {
        // only in hotbots hollow so no one can add random emojis and fuck it
        if (emoji.name == name && warehouses.includes(emoji.guild.id)) {
            emojiToReturn = emoji;
            emojiCache.set(name, emoji);
            break;
        }
    }
    if (!emojiToReturn) emojiToReturn = fallback != undefined ? fallback : '❌'; // if none found
    return emojiToReturn;
}

var pickFromWeightedMap = exports.pickFromWeightedMap = (map) => {
    if (map.size == 0) { console.logger.warn("no options available"); return; }

    let weightSum = 0.0;
    for (const [key, weight] of map) weightSum += weight;

    let rand = Math.random() * weightSum;
    for (const [key, weight] of map) {
        if (rand <= weight) return key;
        rand -= weight;
    }
    console.logger.warn('error picking weighted random option');
    return null; // should never happen lmao but you know OrangeCode™
}

exports.scrambleWord = (word) => {
    let output = "";
    let amount = 13;
    for (var i = 0; i < word.length; i++) {
        let c = word[i];
        if (c.match(/[a-z]/i)) {
            var code = word.charCodeAt(i);
            // uppercase letters
            if (code >= 65 && code <= 90) {
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }

            // lowercase letters
            else if (code >= 97 && code <= 122) {
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }
        output += c;
    }
    return output;
}

// returns false if failed
var addBoost = exports.addBoost = (client, user, boostName) => {
    // clear expired boosts
    clearFinishedBoosts(client, user);
    // check if user has boost
    for (const boost of user.boosts)
        if (boost.name == boostName) return false;
    // add boost to array
    const boostData = { name: boostName, used: new Date() }
    user.boosts.push(boostData);
    return true;
}

var clearFinishedBoosts = exports.clearFinishedBoosts = async (client, user) => {
    let toRemove = []
    for (let i = 0; i < user.boosts.length; i++) {
        let boost = user.boosts[i];
        let boostData = client.boosts.get(boost.name);
        if (!boostData) boostData = client.potions.get(boost.name);
        if (!boostData) { console.log(`couldnt find ${boost.name} data`); continue; }

        if (Date.now() - boost.used >= boostData.duration)
            toRemove.push(boost)
    }
    if (toRemove.length > 0) {
        await creatureUserModel.findOneAndUpdate(
            { userID: user.userID, guildID: user.guildID },
            { $pull: { 'boosts': { $in: toRemove } } }
        );
    }
}

var addThingToUser = exports.addThingToUser = (thingArray, thingName, count) => {
    count = parseInt(count);
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++) {
        if (thingArray[i].name == thingName) {
            thingIndex = i;
            break;
        }
    }
    // add thing to array
    if (thingIndex == -1) {
        const thingData = { name: thingName, count: count }
        thingArray.push(thingData);
    }
    // add 1 to thing count
    else thingArray[thingIndex].count += count;
}

var removeThingFromUser = exports.removeThingFromUser = (thingArray, thingName, count) => {
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++) {
        if (thingArray[i].name == thingName) {
            thingIndex = i;
            break;
        }
    }
    if (thingIndex == -1) return console.logger.warn(`error removing ${thingName} from user: no item exists`)
    if (thingArray[thingIndex].count > count) thingArray[thingIndex].count -= count;
    else thingArray.splice(thingIndex, 1);
}

var sendAlert = exports.sendAlert = async (client, alertContent, guildID, type = "alert") => {
    let channel = await getAlertChannel(client, guildID, type);
    if (!channel) return console.logger.warn("error getting alert channel for " + guildID);
    channel.send(alertContent)
}

var getAlertChannel = exports.getAlertChannel = async (client, guildID, type = "alert") => {
    let guildSettings = await guildSettingsModel.findOne({ guildID: guildID })
    if (!guildSettings) return;

    let channel = -1;
    if (guildSettings.settings.eventChannel != -1 && type == "event") channel = guildSettings.settings.eventChannel;
    else if (guildSettings.settings.alertChannel != -1) channel = guildSettings.settings.alertChannel;
    else if (guildSettings.settings.botChannel != -1) channel = guildSettings.settings.botChannel;
    if (channel != -1) {
        let botC
        try {
            botC = await client.channels.fetch(channel.toString());
        }
        catch (err) {/*console.error("error finding channel",err);*/ } // yeah alright i get it, you dont have access to it 

        if (botC) return botC;
        //else console.error("cant find channel");
    }
}


exports.getPrefix = (client, guildID) => {
    let prefixCustom = client.prefixes.get(guildID)
    return prefixCustom ? prefixCustom : "!";
}

// https://gist.github.com/endel/dfe6bb2fbe679781948c
exports.getMoonPhase = (year, month, day) => {
    let phases = ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon']
    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = Math.floor(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
    return { phase: b, name: phases[b] };
}

exports.fixFPErrors = (val) => {
    return parseFloat(val.toFixed(4));
}
