const creatureUserModel = require(global.src + '/models/creatureUserSchema')
const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');;
const fs = require('fs');
const config = require(global.appRoot + '/config.json');

module.exports = {
    name: 'shop',
    description: 'spend flarins to make yourself feel good',
    usage: "%PREFIX%shop <page>",
    async execute(client, message, args, user, userStats) {
        args[0] = args[0].toLowerCase()

        // gobby trader
        if (args[0] == "gobby") {
            // 3
            if (Date.nowWA().getDay() != config.gobbyTraderDay) return message.channel.send("the gobby trading boat isn't here!") // wed
            var trader = await client.traders.get("GobbyTrader");
            if (!trader) return console.logger.warn("error getting gobby")

            const embed = new MessageEmbed()
                .setColor('#98db81')
                .setTitle(`gobby trading boat!`)
                .setDescription("do !buy <item> to buy an item")

            let itemTexts = {};
            for (const itemName of trader.saleItems) {
                let itemData = await functions.getItem(client, itemName)
                if (!itemData) { console.logger.warn(`error getting ${itemName} data`); continue; }
                if (!itemTexts[itemData.type]) itemTexts[itemData.type] = getItemText(client, itemData, itemData.type, user);
                else itemTexts[itemData.type] += getItemText(client, itemData, itemData.type, user);
            }
            for (const [itemType, itemText] of Object.entries(itemTexts)) {
                embed.addField(itemType, itemText)
            }
            message.channel.send({ embeds: [embed] });
            return;
        }

        // bruh
        let shops = ["bait", "boosts", "upgrades", "seeds", "decorations"];
        let shopsNormal = ["bait", "seeds"];

        if (!args[0]) {
            const shopList = "!shop boosts\n" +
                "!shop upgrades\n" +
                "!shop bait\n" +
                "!shop seeds\n" +
                "!shop decorations\n";

            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle("the eruption emporium")
                .setDescription("do !shop <page> to visit each sub-store\nitems sold go at 80% of their original price")
                .addField("shops", shopList);
            message.channel.send({ embeds: [embed] });
        }
        else if (shops.includes(args[0])) {
            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle(`the eruption emporium: ${args[0]}`)
                .setDescription("do !buy <item> to buy an item." +
                    (args[0] == "boosts" ? " boosts are activated instantly, and do not stack" : ""))

            const itemTypes = fs.readdirSync(`./items/${args[0]}`);
            if (shopsNormal.includes(args[0])) {
                let itemText = [""];
                let textIndex = 0;
                for (const item of itemTypes) {
                    const itemData = require(`../../items/${args[0]}/${item}`);
                    if (itemData.cantBuy) continue;

                    let line = getItemText(client, itemData, args[0], user);
                    // to stop going over the 1024 field limit
                    if ((itemText[textIndex] + line).length > 1024) {
                        textIndex++;
                        itemText.push("");
                    }
                    itemText[textIndex] += line;
                }

                for (const text of itemText)
                    if (text != "") embed.addField(args[0], text, true);
            }
            else {
                for (const itemType of itemTypes) {
                    let itemText = "";
                    let items = fs.readdirSync(`./items/${args[0]}/${itemType}`).filter(file => file.endsWith('.js'));
                    for (const item of items) {
                        const itemData = require(`../../items/${args[0]}/${itemType}/${item}`);
                        if (itemData.cantBuy || itemData.hideInShop) continue;
                        itemText += getItemText(client, itemData, args[0], user);
                    }
                    if (itemText != "") embed.addField(itemType, itemText)
                }
            }
            message.channel.send({ embeds: [embed] });
        }
        else {
            message.channel.send("thats not a store :(");
        }
    }
}
function getItemText(client, itemData, shop, user) {
    let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');
    let itemEmoji = functions.getEmojiFromName(client, itemData.name.replace(" ", ""), '');

    let duration = itemData.duration / (60 * 60 * 1000);
    if (duration < 1) duration = `${duration * 60}m`
    else duration = `${duration}h`

    if (shop == "boosts")
        return `${itemEmoji}**${itemData.name}** - ${itemData.effect} for ${duration} - **${itemData.price}**${flarinEmoji}\n`;


    else if (shop == "upgrades") {
        let count = 0;
        for (const upgrade of user.upgrades)
            if (itemData.name == upgrade.name) count = upgrade.count;

        return `**${itemData.name}** - **${itemData.price}**${flarinEmoji}\n` +
            `Effect - ${itemData.effect}\n` +
            `Current: ${count}/${itemData.max}\n`;
    }


    else if (shop == "bait")
        return `${itemEmoji}**${itemData.name}** - ${itemData.effect} - **${itemData.price}**${flarinEmoji}\n`;


    else if (shop == "seeds") {
        let plantData = client.plants.get(itemData.name.replace(" Seeds", ""));
        if (!plantData) {
            console.logger.warn(`error getting ${itemData.name} plant data`)
            return `${itemEmoji}**${itemData.name}** - **${itemData.price}**${flarinEmoji}\n`;
        }
        var itemText = `${itemEmoji}**${itemData.name}** - **${itemData.price}**${flarinEmoji}\n` +
        `- 🌿Grow Time: ${new Date(plantData.growTime).toCountdown()}\n` +
        `- 💧Water Rate: Every ${new Date(plantData.waterRate).toCountdown()}\n` +
        `- 🌾Yield: ${plantData.plantYield}\n`;
        if (plantData.plantedEffect) itemText +=`- ✨planted effect: ${plantData.plantedEffect}\n`

        return itemText;
    }

    else if (shop == "decorations") {
        let count = 0;
        for (const decoration of user.inventory.decorations)
            if (itemData.name == decoration.name) count = decoration.count;

        let emoji = count == itemData.max ? '✅' : '';
        return `${emoji}**${itemData.name}** - ${itemData.desc} - **${itemData.price}**${flarinEmoji}\n`;
    }

    else
        return "ERROR";
}