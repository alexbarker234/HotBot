const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const functions = require("./functions.js");

exports.checkEgg = async (client, user, userStats, message) => {
    try {
        const minsSinceRoll = (Date.now() - user.lastMsg.getTime()) / (1000 * 60); 
        if (minsSinceRoll <= userStats.eggCD) return

        // set last roll date
        await creatureUserModel.findOneAndUpdate({userID: user.userID, guildID: user.guildID}, { lastMsg: new Date().getTime() }, { upsert: true });

        const eggChance = userStats.eggChance;

        console.log('\x1b[36m%s\x1b[0m', `${Date.nowWA().toHM()}:`, `${functions.fixFPErrors(eggChance * 100)}% egg roll for ${message.author.username}`);

        if (Math.random() < eggChance && user.eggs.length < userStats.eggSlots) {
            const egg = await chooseEgg(client, message, user);
            if (egg) {
                console.log('\x1b[36m%s\x1b[0m', `${Date.nowWA().toHM()}:`, `given ${message.author.username} a ${egg.name} egg`);

                let emoji = functions.getEmojiFromName(client, egg.name + "Egg");
                if (emoji == "❌") emoji = '🥚';
                message.react(emoji);

                const eggData = { name: egg.name, obtained: new Date(), hatchTime: egg.hatchTime }
                // push egg
                await creatureUserModel.findOneAndUpdate(
                    {userID: user.userID, guildID: user.guildID}, 
                    {$push : {'eggs': eggData}}
                );
            } else console.log("no egg was found!");
        }
    }
    catch (err) {
        console.log(err);
    }
}

var calculateWeight = exports.calculateWeight = (client, user, creature, userStats) => {
    let weight = userStats.eggWeightScales.get(creature.name);
    if (!weight) weight = 1;
    return creature.weight(client, user) * weight
}

var chooseEgg = exports.chooseEgg = async (client, message, user) => {
    const userStats = await functions.getUserStats(client, user.userID, user.guildID);

    let weightSum = 0.0;
    for (const [name, creature] of client.creatures) weightSum += calculateWeight(client, user, creature, userStats);

    let rand = Math.random() * weightSum;
    for (const [name, creature] of client.creatures) {
        if (rand <= calculateWeight(client, user, creature, userStats)) return creature;
        rand -= calculateWeight(client, user, creature, userStats); // subtract the weight so the total is only the sum of remaining options
    }
    console.log('error picking egg');
    return null; // should never happen lmao but you know OrangeCode™
}
