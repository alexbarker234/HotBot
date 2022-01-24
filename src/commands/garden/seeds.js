const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');;

module.exports = {
    name: 'seeds',
    description: 'see the details of your owned seeds',
    usage: "%PREFIX%seeds",
    async execute(client, message, args, user, userStats){  
        let seedText = "";
        for (const item of user.inventory.seeds) {
            let plantData = client.plants.get(item.name.replace(" Seeds", ""));
            if (!plantData) {
                seedText += `**${item.name}** x${item.count}`
                console.log(`error getting ${item.name} plant data`)
               continue;
            }
            let emoji = functions.getEmojiFromName(client, item.name);
            seedText += `${emoji}**${item.name}** x${item.count}\n` +
                `- 🌿Grow Time: ${new Date(plantData.growTime).toCountdown()}\n` +
                `- 💧Water Rate: Every ${new Date(plantData.waterRate).toCountdown()}\n` +
                `- 🌾Yield: ${plantData.plantYield}\n`;
            if (plantData.plantedEffect) seedText += `- ✨Planted Effect: ${plantData.plantedEffect}`
        }
        if (seedText == "") seedText = "you are seedless :(";
        const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle(message.author.username + "'s inventory")
            .addField("seeds", seedText);
        message.channel.send({ embeds: [embed] });
    }
} 
