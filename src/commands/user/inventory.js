const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');;

const t = "`";

module.exports = {
    name: 'inventory',
    description: 'view your inventory',
    usage: "!inventory\n"
        + "!inventory <item>",
    alt: 'item',
    async execute(client, message, args, user, userStats){          
        if (args[0]) {
            let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');

            let itemName = args.join(' ').toCaps();
            let itemFound;
            for (const [key, value] of Object.entries(user.inventory)) {
                if (itemFound) break;
                for (const item of user.inventory[key]){
                    if (item.name == itemName) {
                        itemFound = item;
                        break;
                    }
                }
            }
            if (!itemFound) return message.channel.send(`you dont have any ${itemName}`);

            let itemEmoji = functions.getEmojiFromName(client, itemName,'');

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(`${itemEmoji}${itemName}${itemEmoji}`)
            let itemData = functions.getItem(client, itemName);
            let plantData = client.plants.get(itemName.replace(" Seeds", ""));
            if (!itemData) return message.channel.send("error getting item data")

            if (itemData.desc && itemData.desc != "") embed.setDescription(itemData.desc)
            if (itemData.price && !itemData.cantSell) embed.addField("value", `${itemData.price}${flarinEmoji}`)
            
            let detailsString = ""    
            if (itemData.effect) detailsString += `${t}❓effect❓${t}\n- ${itemData.effect}\n`
            if (itemData.duration) detailsString += `${t}🕓duration🕓${t}\n- ${new Date(itemData.duration).toCountdown()}\n`
            if (plantData) {
                if (plantData.growTime) detailsString += `${t}🌿grow time🌿${t}\n- ${new Date(plantData.growTime).toCountdown()}\n`
                if (plantData.waterRate) detailsString += `${t}💧water rate💧${t}\n- every ${new Date(plantData.waterRate).toCountdown()}\n`
                if (plantData.plantYield) detailsString += `${t}🌾yield🌾${t}\n- ${plantData.plantYield} ${plantData.name}\n` 
                if (plantData.plantedEffect) detailsString += `${t}✨planted effect✨${t}\n- ${plantData.plantedEffect}\n`
            }
            if (detailsString) embed.addField("details", detailsString)
            message.channel.send({ embeds: [embed] });
        }

        // WHOLE INVENTORY

        else {
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.author.username + "'s inventory")
                .setDescription("do **!seeds** to view more details on your seeds")

            for (const [key, value] of Object.entries(user.inventory)) {
                if (key == "fish") continue;
                let invText = "";
                for (const item of user.inventory[key]){
                    let itemEmoji = functions.getEmojiFromName(client, item.name,'');
                    invText += `${itemEmoji}**${item.name}** x${item.count}\n`
                }
                embed.addField(key, invText == "" ? "none" : invText, true);
            }
            message.channel.send({ embeds: [embed] });
        }
    }
}   