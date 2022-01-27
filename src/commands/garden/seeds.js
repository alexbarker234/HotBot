const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');;

module.exports = {
    name: 'seeds',
    description: 'see the details of your owned seeds',
    usage: "%PREFIX%seeds",
    async execute(client, message, args, user, userStats){  
        let seedText = [""];
        let textIndex = 0;
        for (const item of user.inventory.seeds) {
            let plantData = client.plants.get(item.name.replace(" Seeds", ""));
            if (!plantData) {
                line += `**${item.name}** x${item.count}`
                console.log(`error getting ${item.name} plant data`)
               continue;
            }
            let emoji = functions.getEmojiFromName(client, item.name);
            line = `${emoji}**${item.name}** x${item.count}\n` +
                `- 🌿Grow Time: ${new Date(plantData.growTime).toCountdown()}\n` +
                `- 💧Water Rate: Every ${new Date(plantData.waterRate).toCountdown()}\n` +
                `- 🌾Yield: ${plantData.plantYield}\n`;
            if (plantData.plantedEffect) line += `- ✨Planted Effect: ${plantData.plantedEffect}\n`

            if ((seedText[textIndex] + line).length > 1024) {
                textIndex++; 
                seedText.push("");
            }
            seedText[textIndex] += line;
        }
        const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle(message.author.username + "'s inventory")
        seedText.map(text => { if(text != "") embed.addField("seeds", text, true) });
        message.channel.send({ embeds: [embed] });
    }
} 
