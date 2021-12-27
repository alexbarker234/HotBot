const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')
const fishFunctions = require('../../fishFunctions.js')

const fishCD = new Map();
const config = require("../../config.json");

module.exports = {
    name: 'fish',
    description: `fish. has a ${config.fishCD} second cooldown`,
    usage: "%PREFIX%fish\n" +
            "%PREFIX%fish list",
    async execute(client, message, args, user, userStats){  
        if (args[0] == "list") {
            let fishText = "";
            let fishValue = "";
            let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');
            for (const f of user.inventory.fish) {
                let emoji = functions.getEmojiFromName(client, f.name);
                const fishData = client.fish.get(f.name);
                if (!fishData) return console.log("error getting data for " + f.name);
                fishText += `${emoji} ${f.name}: ***${f.count}***\n`;
                fishValue += `${fishData.price}${flarinEmoji}\n`;
            }

            const embed = new MessageEmbed()
                .setColor('#1b46e0')
                .setTitle(message.author.username + "'s fish")
            if (fishText == "") embed.addField("fish", "you are fishless", true);
            else {
                embed.addField("fish", fishText, true);
                embed.addField("value", fishValue, true);
            }
            message.channel.send({embeds: [embed]});
        }
        else {
            let lastFished = fishCD.get(message.author.id);
            if (!lastFished) lastFished = 0; // if not in map
            
            if (Date.now() - lastFished > config.fishCD * 1000) {
                fishCD.set(message.author.id, Date.now());

                //color: #053233
                // FISH
                let caughtList = [];
                const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);
                if (Math.random() < userStats.fishChance) {           
                    let bonus = Math.random() < userStats.bonusFishChance ? 2 : 1;
                    for (let i = 0; i < bonus; i++) {           
                        const fish = fishFunctions.chooseFish(client, userStats.rareFishScale);
                        if (!fish) return console.log("error getting fish");

                        functions.addThingToUser(user.inventory.fish, fish.name, 1);
                        caughtList.push(fish.name);
                    }
                }
                let caughtString = "";
                for (const caught of caughtList) {
                    let emoji = functions.getEmojiFromName(client, caught);
                    caughtString += `${emoji}${caught}\n`;
                }
                user.stats.totalFish += caughtList.length;
                user.stats.timesFished++;

                //endcolor
                
                //color:#331818
                // CHESTS
                let chest;
                if (Math.random() < userStats.chestChance) chest = await fishFunctions.chooseChestRewards(client, user, true);
                // manage chest rewards

                let chestString = "";
                if (chest) {
                    for (chestReward of chest.chestRewards) {
                        let emoji = functions.getEmojiFromName(client, chestReward.name,'');
                        chestString += `${emoji}${chestReward.name} **x${chestReward.count}**\n`;
                    }
                    if (chest.flarinReward > 0) { 
                        let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');
                        chestString += `${chest.flarinReward}${flarinEmoji}\n`;
                    }
                    user.stats.totalChests++;
                }
                
                if (caughtString == "") caughtString = "nothing :(";
                let bait = user.baitEquipped;

                const embed = new MessageEmbed()
                    .setColor('#1b46e0')
                    .setTitle("fishing")
                embed.addField("you caught", caughtString);

                if (chest) {
                    let chestEmoji = functions.getEmojiFromName(client, "Chest" + chest.chestTier);
                    if (chestString != "") embed.addField(`you found a chest! ${chestEmoji}`, chestString);
                }
                //endcolor

                if (bait && bait != "none") { 
                    let emoji = functions.getEmojiFromName(client, bait);
                    // remove bait
                    let baitIndex = -1;
                    for (let i = 0; i < user.inventory.bait.length; i++){
                        if (user.inventory.bait[i].name == bait){
                            baitIndex = i;
                            break;
                        }
                    }
                    if (baitIndex != -1) {
                        if (user.inventory.bait[baitIndex].count > 1) user.inventory.bait[baitIndex].count -= 1;
                        else {
                            user.inventory.bait.splice(baitIndex, 1);
                            bait += `\nyou used the last of your **${emoji}${bait}**`
                            user.baitEquipped = "none";
                        }
                        embed.addField("bait", `${emoji}${bait}`);
                    }
                }
                message.channel.send({ embeds: [embed] });

                user.save();
            }
            else {
                let cooldown = (config.fishCD - (Date.now() - lastFished) / 1000).toFixed(2);
                message.channel.send(`you cant fish for another ${cooldown} seconds`)
            }
        }
    }
}   

