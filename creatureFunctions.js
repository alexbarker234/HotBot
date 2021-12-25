const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const creatureUserModel = require('./models/creatureUserSchema');
const guildSettingsModel = require('./models/guildSettingsSchema');
const functions = require("./functions.js");

let eggCD = []; // reset every 30 seconds, so we dont have to fetch from DB as much
const clearEggCD = () => {
    eggCD = [];
    setTimeout(clearEggCD, 1000 * 30);
};
clearEggCD();

async function checkEgg(Discord, client, message) {
    try {
        if (!eggCD.includes(message.author.id)) {
            const filter = { userID: message.author.id, guildID: message.guild.id }
            let user = await creatureUserModel.findOne(filter);

            // create profile if it doesnt exist
            if (user == null){
                let profile = await creatureUserModel.create({
                    userID: message.author.id,
                    guildID: message.guild.id,
                    lastMsg: 0
                });
                profile.save();
                user = await creatureUserModel.findOne(filter);
            }

            const lastMsg = new Date(user.lastMsg).getTime();
            const diff = Math.abs(new Date().getTime() - lastMsg);
            const diffMinutes = diff / (1000 * 60);

            //console.log("been " + (diff / 1000) + " seconds since " + message.author.username + " sent the message to get egg");
            const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);

            if (diffMinutes <= userStats.eggCD) {
                eggCD.push(message.author.id); // adds to cache
                //console.log("timer not done, adding to cache");
            }
            else {
                const update = { lastMsg: new Date().getTime() }
                user = await creatureUserModel.findOneAndUpdate(filter, update, {upsert: true});

                const eggChance = userStats.eggChance;
                
                console.log(`${(new Date).addHours(8).toHM()}: ${functions.fixFPErrors(eggChance * 100)}% egg roll for ${message.author.username}`);

                if (Math.random() < eggChance && user.eggs.length < userStats.eggSlots){
                    const egg = chooseEgg(client, message, user);
                    if (egg) {
                        console.log(`given ${message.author.username} a ${egg.name} egg`);   

                        let emoji = functions.getEmojiFromName(client, egg.name + "Egg");
                        if (!emoji) emoji = '🥚';
                        message.react(emoji);

                        const eggData = {name : egg.name, obtained : new Date(), hatchTime : egg.hatchTime }
                        user.eggs.push(eggData);
                        user.save();                      
                    } else console.log("no egg was found!");
                }
            }
        } 
        else { 
            //console.log(message.author.username + " is in the cache")          
        }

    }
    catch (err) {
        console.log(err);
    }
}

function chooseEgg(client, message, user){
    availableEggs = [];
    
    for (const [name, creature] of client.creatures) {
        if (creature.available(client, user)) availableEggs.push(creature);
    } 

    if (availableEggs.length == 0) { console.log("no eggs available"); return; }

    let weightSum = 0.0;
    for (const egg of availableEggs) weightSum += egg.rarity(client, user);
    let rand = Math.random() * weightSum;
    for (const egg of availableEggs) {
        if (rand <= egg.rarity(client, user)) return egg;
        rand -= egg.rarity(client, user); // subtract the weight so the total is only the sum of remaining options
    }
    console.log('error picking egg');
    return null; // should never happen lmao but you know OrangeCode™
}



module.exports = {checkEgg, chooseEgg};