const { MessageEmbed } = require('discord.js');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const warehouses = ['907483410258337803','907492571503292457', '862206016510361600', '917654307648708609']
const config = require("./config.json");
const seedrandom = require('seedrandom');

exports.getUser = async (userID, guildID) => {
    let user;
    try {  user = await creatureUserModel.findOne({ userID: userID, guildID: guildID }); }
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

exports.managePlanReactions = async(reaction) => {
    let can = cant = maybe = '';

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
    await reaction.message.edit({embeds: [embed]});
}

// this feels like the worst way to do this lmao
var getUserStats = exports.getUserStats = async(client, userID, guildID) => {

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
        /*statObject.chestChance = 0.7;
        statObject.eggCD = 0;
        statObject.eggChance = 1;*/
    }

    const filter = { userID: userID, guildID: guildID }
    let user = await creatureUserModel.findOne(filter);
    if (!user) return console.error("error getting profile for stats");

    clearFinishedBoosts(client, user);

    // boooosts
    for (const boost of user.boosts) {
        let boostData = client.boosts.get(boost.name);
        if (!boostData) boostData = client.potions.get(boost.name);
        if (!boostData) {console.error(`couldnt find ${boost.name} data`); continue;}
        if (Date.now() - boost.used < boostData.duration) {
            boostData.updateStats(statObject);
        }
    }
    // upgrades
    for (const upgrade of user.upgrades) {
        let upgradeData = client.upgrades.get(upgrade.name);
        if (!upgradeData) {console.error(`couldnt find ${upgrade.name} data`); continue;}
        upgradeData.updateStats(statObject, upgrade.count);    
    }
    // garden

    let plantEffects = new Map();
    for (const plant of user.garden.plants) {
        if (plant.name == "none") continue;
        let plantData = client.plants.get(plant.name);
        if (!plantData) {console.error(`couldnt find ${plant.name} data`); continue;}
        if (plantData.updateStats) {
            let mapEntry = plantEffects.get(plantData.name)
            if (mapEntry) plantEffects.set(plantData.name, mapEntry + 1)
            else plantEffects.set(plantData.name, 1)
        }   
    }
    for (const [name, amount] of plantEffects) {
        let plantData = client.plants.get(name);
        if (!plantData) {console.error(`couldnt find ${name} data`); continue;}
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

var weightScale = exports.weightScale = (map, influence) => {
    let weightSum = 0;
    for (const [key, value] of map) weightSum += value;
    averageWeight = weightSum / map.size;

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

    seeds = new Map();
    seeds.set("Gasbloom Seeds", 0.5);
    seeds.set("Sparklethorn Seeds", 0.4);
    seeds.set("Ashdrake Seeds", 0.3);
    seeds = weightScale(seeds, userStats.butterflyMultiplier - 1)

    baitOptions = new Map();
    baitOptions.set("Orbide", 0.8);
    baitOptions.set("Flareworm", 0.6);
    baitOptions.set("Bloodleech", 0.3);
    baitOptions = weightScale(baitOptions, userStats.butterflyMultiplier - 1)

    let min = 2;
    let max = 6;
    let target = min + ((max- min) * (userStats.butterflyMultiplier- 1))
    let numRewards = Math.floor(Math.biasedRand(min, max, 1.3, target)) // 2-5 rewards, more likely to get less    
    for (let i = 0; i < numRewards; i++) {
        let rand = Math.floor(Math.random() * 2);
        if (rand == 0) {
            let seedChoice = pickFromWeightedMap(seeds);
            if (!client.seeds.get(seedChoice)) { console.log(`butterfly seed ${seedChoice} doesnt exist`); continue; }

            addThingToUser(itemRewards, seedChoice, 1) // not adding to user, just adding to array
            if (addToUser) addThingToUser(user.inventory.seeds, seedChoice, 1);
        }
        else if (rand == 1) {
            let baitChoice = pickFromWeightedMap(baitOptions);
            if (!client.bait.get(baitChoice)) { console.log(`butterfly bait ${baitChoice} doesnt exist`); continue; }
            let baitNum = Math.floor(Math.biasedRand(5, 30, 15, 0.8));
            
            addThingToUser(itemRewards, baitChoice, baitNum)
            if (addToUser) addThingToUser(user.inventory.bait, baitChoice, baitNum);
        }
    }

    let dustReward = Math.floor(Math.biasedRand(1,50,10,1.5));
    addThingToUser(itemRewards, "Butterfly Dust", dustReward);
    if (addToUser) addThingToUser(user.inventory.misc, "Butterfly Dust", dustReward);

    return { itemRewards: itemRewards};
}

exports.isRaining = (client, user) => {
    let rainCaster = false;
    if (user) rainCaster = userHasBoost(user, "Raincaster");
    return client.weatherCache.weather == "Rain" || client.weatherCache.weather == "Drizzle" || rainCaster;
}

exports.getUpgradeCount = (user, upgradeName) => {
    for (const upgrade of user.upgrades) 
        if (upgrade.name == upgradeName) return upgrade.count;
}

var getHotness = exports.getHotness = (userID, prevDay) => {
    let day = Math.trunc((Date.now() + 28800000) / 86400000); // 28800000 is adding 8 hours because timezone
    if (prevDay) day = Date.parseWADate(prevDay);

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
exports.getEmojiFromName = (client, name) => {
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
    if (!emojiToReturn) emojiToReturn = '❌'; // if none found
    return emojiToReturn;
}

var pickFromWeightedMap = exports.pickFromWeightedMap = (map) => {
    if (map.size == 0) { console.log("no options available"); return; }

    let weightSum = 0.0;
    for (const [key, weight] of map) weightSum += weight;

    let rand = Math.random() * weightSum;
    for (const [key, weight] of map) {
        if (rand <= weight) return key;
        rand -= weight;
    }
    console.log('error picking weighted random option');
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
exports.addBoost = (client, user, boostName) => {
    // clear expired boosts
    clearFinishedBoosts(client, user);
    // check if user has boost
    for (const boost of user.boosts)
        if (boost.name == boostName) return false;
    // add boost to array
    const boostData = { name : boostName, used : new Date() }
    user.boosts.push(boostData);
    return true;
}

var clearFinishedBoosts = exports.clearFinishedBoosts = async (client, user) => {
    let toRemove = []
    for (let i = 0; i < user.boosts.length; i++){
        let boostData = client.boosts.get(user.boosts[i].name);
        if (!boostData) boostData = client.potions.get(user.boosts[i].name);
        if (!boostData) {console.log(`couldnt find ${boost.name} data`); continue;}

        if (Date.now() - user.boosts[i].used >= boostData.duration) 
            toRemove.push(user.boosts[i])      
    }
    if (toRemove.length > 0){
        await creatureUserModel.findOneAndUpdate(
            {userID: user.userID, guildID: user.guildID}, 
            {$pull : {'boosts': { $in: toRemove }}}
        );
    }
}

var addThingToUser = exports.addThingToUser = (thingArray, thingName, count) => {
    count = parseInt(count);
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++){
        if (thingArray[i].name == thingName){
            thingIndex = i;
            break;
        }
    }
    // add thing to array
    if (thingIndex == -1) {
        const thingData = { name : thingName, count : count }
        thingArray.push(thingData);
    }
    // add 1 to thing count
    else thingArray[thingIndex].count += count; 
}

var removeThingFromUser = exports.removeThingFromUser = (thingArray, thingName, count) => {
    // check if user has thing
    let thingIndex = -1;
    for (let i = 0; i < thingArray.length; i++){
        if (thingArray[i].name == thingName){
            thingIndex = i;
            break;
        }
    }
    if (thingIndex == -1) return console.log(`error removing ${thingName} from user: no item exists`)
    if (thingArray[thingIndex].count > count) thingArray[thingIndex].count -= count;
    else thingArray.splice(thingIndex, 1);
}

var sendAlert = exports.sendAlert = async (client, alertContent, guildID) => {
    let guildSettings = await guildSettingsModel.findOne({guildID: guildID})
    if (!guildSettings) return;

    let channel = -1;
    if (guildSettings.settings.alertChannel != -1) channel = guildSettings.settings.alertChannel;
    else if (guildSettings.settings.botChannel!= -1) channel = guildSettings.settings.botChannel;
    if (channel != -1) {
        let botC
        try {
            botC = await client.channels.fetch(channel.toString());
        }
        catch (err) {console.error("error finding channel",err);}
        if (botC) botC.send(alertContent)
        else console.error("cant find channel");
    }
}

exports.getPrefix = (client, guildID) => {
    let prefixCustom = client.prefixes.get(guildID)         
    return prefixCustom ? prefixCustom : "!";
}

// https://gist.github.com/endel/dfe6bb2fbe679781948c
exports.getMoonPhase = (year, month, day) => { 
    phases = ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon']
    let c = e = jd = b = 0;

    if (month < 3) {
      year--;
      month += 12;
    }

    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = parseInt(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
    return {phase: b, name: phases[b]};
}

exports.fixFPErrors = (val) => {
    return parseFloat(val.toFixed(4));
}

String.prototype.fixFPErrors = 
Number.prototype.fixFPErrors = 
() => {
    return parseFloat(this.toFixed(4));
}

Math.clamp = function(num, min, max) { return Math.min(Math.max(num, min), max); }

//  modified to allow larger influencesversion of : https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range
Math.biasedRand = function(min, max, bias, influence) {
    var rnd = Math.random() * (max - min) + min,                // random in range
        mix = Math.clamp(Math.random() * influence, 0, 1);      // random mixer
    return rnd * (1 - mix) + bias * mix;                        // mix full range and bias
}

String.prototype.equalsIgnoreCase = function(otherString) {
    return this.localeCompare(otherString, undefined, { sensitivity: 'accent' }) == 1; // == 1 because it returns a number, 1 will be true
}

String.prototype.toCaps = function() {
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return this.split(' ').map(capitalize).join(' ');
}

Date.nowWA = function() {
    return new Date((new Date().getTime() + new Date().getTimezoneOffset() + 480));
}

Date.parseWADate= function(date){
    let pieces = date.split("/");
    let toParse = date; 

    if (pieces[0].length <= 2) toParse = pieces[1] + "/" + pieces[0] + "/" + pieces[2]; // converts from the right way to the american way

    return new Date(Date.parse(toParse)).addHours(8);
}

Date.prototype.toCountdown = function(){
    const days = Math.floor(this.getTime() / (1000 * 60 * 60 * 24));
    const timeHMS = new Date(this.getTime()).toISOString().substr(11, 8);
    const hours = parseInt(timeHMS.substr(0, 2));
    const mins = parseInt(timeHMS.substr(3, 5));
    const secs = parseInt(timeHMS.substr(6, 8));

    let string = "";
    if(days != 0) string += `${days}d `
    if(hours != 0) string += `${hours}h `
    if(mins != 0) string += `${mins}m `
    if(secs != 0) string += `${secs}s `
    if (string == "") string = "0s"; // if the timer is 0;

    /*(days > 0 ? days + "d " : "") + 
            (hours > 0 || days > 0 ? hours + "h " : "") +
            (mins > 0 || hours > 0 || days > 0 ? mins + "m " : "") +
            secs + "s ";*/

    return string;
}

Date.prototype.toDMYHM= function(){
    return this.getDate() + "/" + this.getMonth() + "/" + this.getFullYear() + " " + this.getHours() + ":" + ('0'+this.getMinutes()).slice(-2);;
}

Date.prototype.toHM= function(){
    return this.getHours() + ":" + ('0'+this.getMinutes()).slice(-2);;
}

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
 // 23 - 1
Date.prototype.betweenHours= function(min, max) {
    if (min > max) return this.getHours() >= min || this.getHours() < max;
    return this.getHours() >= min && this.getHours() < max;
}

// sorts by value not key
Map.prototype.sortMap = function() {
    // spread syntax (...) expands map into its values
    // sort returns an array with the key and value as index 0 and 1 respectively
    return new Map([...this.entries()].sort((a, b) => b[1] - a[1]));
}
Map.prototype.sortMapObject = function(byField) {
    return new Map([...this.entries()].sort((a, b) => b[1][byField] - a[1][byField]));
}
