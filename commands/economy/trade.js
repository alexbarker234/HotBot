const tradeModel = require('../../models/tradeSchema');
const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'trade',
    description: 'create a trade request with someone',
    usage: "%PREFIX%trade\n"
        + "%PREFIX%trade create [user]\n"
        + "%PREFIX%trade add/remove send/request [name] [count]\n"
        + "%PREFIX%trade accept/unaccept/reject",
    async execute(client, message, args, user, userStats) {
        let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');

        if (args[0] == "create") {
            if (!args[1]) return message.channel.send("please tag a user to start a trade with")
            const receiverID = args[1].replace(/[\\<>@#&!]/g, "");

            // make sure they arent in an existing trade deal
            let existingDeal = await getTradeData(message.author.id, message.guild.id);
            if (!existingDeal) existingDeal = await getTradeData(receiverID, message.guild.id);
            if (existingDeal) return message.channel.send("one of you is already in another trade deal!");

            var tradeData = new tradeModel({
                guildID: message.guild.id,
                status: 'Open',
                startDate: new Date(),
                traders: [
                    { userID: message.author.id, accepted: false, items: [] },
                    { userID: receiverID, accepted: false, items: [] }
                ]
            });

            sendTradeMessage(client,tradeData, message.channel);
     
            tradeData.save();
        }
        else {
            let tradeData = await getTradeData(message.author.id, message.guild.id);
            if (!tradeData) return message.channel.send("you are not in an open trade deal")

            // check if trade deal is valid
            let tradeModified = false;
            for (let i = 0; i < tradeData.traders.length; i++) {
                let userProfile = await functions.getUser(tradeData.traders[i].userID, tradeData.guildID);
                if (!userProfile) return message.reply("couldnt find user profile")

                for (const item of tradeData.traders[i].items) { 
                    let itemData = getItemData(client, item.name);

                    let enough = userHasEnough(tradeData.traders[i], userProfile, itemData)
                    if (enough == true) continue;

                    tradeModified = true;
                    item.count = enough.has;   
                }
            }
            if (tradeModified) message.channel.send("**❗a user no longer has enough items to trade❗\nnew deal:\n**")

            if (!args[0]) {
                sendTradeMessage(client, tradeData, message.channel);
            }
            else if (args[0] == "add" || args[0] == "remove") {
                if (!["request", "send"].includes(args[1])) 
                    return message.channel.send("please specify whether you are changing the items you are requesting or sending")
                let itemCount = parseInt(args[2]);
                let itemName = args.slice(3).join(' ').toCaps();;
                if (itemName == "Flarins") itemName = "Flarin";
    
                if (isNaN(itemCount)) return message.channel.send(`${args[2]} is not a number`)
    
                // get item     
                let itemData = getItemData(client,itemName);
                if (!itemData) return message.channel.send(`${itemName} doesnt exist`);
                if (itemData.cantTrade) return message.channel.send(`${itemName} isnt tradable`)
    
                // find which side is being modified
                let side = -1;
                if (args[1] == "request")
                    side = tradeData.traders[0].userID == message.author.id ? 1 : 0
                else if (args[1] == "send")
                    side = tradeData.traders[0].userID == message.author.id ? 0 : 1
                if (side == -1) return message.channel.send("error getting trade side")
    
                // find user
                let user = await creatureUserModel.findOne({ userID: tradeData.traders[side].userID, guildID: message.guild.id });
                if (!user) return message.reply("couldnt find user profile")
    
                if (args[0] == "add") {
                    let enough = userHasEnough(tradeData.traders[side], user, itemData, itemCount)
                    // errors
                    if (enough != true) {
                        if (itemName == "Flarin") {
                            if (args[1] == "send") return message.channel.send(`you only have ${enough.has}${flarinEmoji} and are trying to send ${enough.needs}`)
                            else return message.channel.send(`they only have ${enough.has}${flarinEmoji} and you are requesting ${enough.needs}`)
                        }
                        else {
                            if (args[1] == "send") return message.channel.send(`you only have ${enough.has} ${itemName} and are trying to send ${enough.needs}`)
                            else return message.channel.send(`they only have ${enough.has} ${itemName} and you are requesting ${enough.needs}`)
                        }
                    }
                    functions.addThingToUser(tradeData.traders[side].items, itemName, itemCount)
                }
                else if (args[0] == "remove") {
                    functions.removeThingFromUser(tradeData.traders[side].items, itemName, itemCount)
                }
                else return message.channel.send("please specify whether you are adding or removing from the trade")
    
                // make both accepts be false since the deal changed
                for (const traderData of tradeData.traders) traderData.accepted = false;
    
                sendTradeMessage(client, tradeData, message.channel);
            }
            else if (["reject", "accept", "unaccept"].includes(args[0]) && !tradeModified) {
                // find trader
                let trader = tradeData.traders.find(x => x.userID == message.author.id);
    
                if (args[0] == "accept") trader.accepted = true;
                else if (args[0] == "unaccept") trader.accepted = false;
                else tradeData.status = "rejected";
    
                let bothAccepted = !tradeData.traders.find(x => !x.accepted); // if it cant find one thats false
    
                if (bothAccepted) {
                    console.log("trade accepted, giving items");
    
                    tradeData.status = "Accepted";
                   
                    let users = []
                    users[0] = await functions.getUser(tradeData.traders[0].userID,  message.guild.id)
                    users[1] = await functions.getUser(tradeData.traders[1].userID,  message.guild.id)
    
                    if (!users[0] || !users[1]) return message.reply("couldnt find user profile")
    
                    for (let i = 0; i < tradeData.traders.length; i++) {
                        for (const item of tradeData.traders[i].items) { 
                            if (item.name == "Flarin") {
                                users[i].flarins -= item.count;
                                users[1 - i].flarins += item.count;
                            }
                            else {
                                let itemData = getItemData(client,item.name);
    
                                let giverInv = itemData.type == "creature" ? users[i].creatures : users[i].inventory[itemData.type];
                                let receiverInv = itemData.type == "creature" ? users[1 - i].creatures : users[1 - i].inventory[itemData.type];
                                if (!giverInv || !receiverInv) return message.channel.send("error getting inventory")
    
                                functions.addThingToUser(receiverInv, item.name, item.count);
                                functions.removeThingFromUser(giverInv, item.name, item.count);
                            }
                        }
                    }
                    users.map(x => x.save()) // save both users
                    message.channel.send("trade complete!")
                }
                sendTradeMessage(client,
                    tradeData, 
                    message.channel, 
                    tradeData.status == "rejected" ? `rejected by ${message.author.username}` : tradeData.status,
                    (bothAccepted ? '#70db7e' : (tradeData.status == "rejected" ? '#d96c7b' : '#f0c862'))
                );
            }
            else sendTradeMessage(client, tradeData, message.channel);
            tradeData.save();
        }
    }
}
async function getTradeData(userID, guildID) {
    let tradeData = await tradeModel.findOne({
        status: "Open",
        guildID: guildID,
        $or: [
            { "traders.0.userID": userID },
            { "traders.1.userID": userID }
        ]
    })
    return tradeData;
}
function getItemData(client, itemName) {
    if (itemName != "Flarin") {
        itemData = functions.getItem(client, itemName);
        if (!itemData) itemData = client.creatures.get(itemName);
        return itemData
    }
    else return { name: "Flarin" }
}
function userHasEnough(trader, user, itemData, additional = 0) {
    // flarins
    if (itemData.name == "Flarin") {
        let tradeItem = trader.items.find(x => x.name == 'Flarin');
        let alreadyInTrade = tradeItem ? tradeItem.count : 0;

        if (user.flarins < additional + alreadyInTrade) 
            return {has: user.flarins, needs: additional + alreadyInTrade}
        
    }
    // regular items / creatures
    else {
        let tradeItem = trader.items.find(x => x.name == itemData.name);
        let alreadyInTrade = tradeItem ? tradeItem.count : 0;

        let userItemCount = 0;
        if (itemData.type == "creature") userItemCount = functions.userCreatureCount(user, itemData.name);
        else userItemCount = functions.userItemCount(user, itemData.name)

        if (userItemCount < additional + alreadyInTrade) 
            return {has: userItemCount, needs: additional + alreadyInTrade}
    }
    return true;
}
function sendTradeMessage(client, tradeData, channel, statusString, color = '#f0c862') {
    var sideString = [];
    for (const trader of tradeData.traders) {
        let itemInfo = "";
        let creatureInfo = "";
        for (const item of trader.items) {
            if (item.name == "Flarin") itemInfo += `${item.count}${functions.getEmojiFromName(client, "flarin", '💰')}\n`;
            else if (client.creatures.get(item.name)) creatureInfo += `${functions.getEmojiFromName(client, item.name, '')} ${item.name} **x${item.count}**\n`;
            else itemInfo += `${functions.getEmojiFromName(client, item.name, '')} ${item.name} **x${item.count}**\n`;
        }
        if (!itemInfo) itemInfo = 'nothing';
        if (!creatureInfo) creatureInfo = 'nothing';
        let check = functions.getEmojiFromName(client, "check", '✅');
        sideString.push(`<@!${trader.userID}>\naccepted: ${trader.accepted ? check : '❌'}\n\n**items**\n${itemInfo}\n\n**creatures**\n${creatureInfo}`)
    }
    if (!statusString) statusString = tradeData.status
    const embed = new MessageEmbed()
        .setColor(color)
        .setTitle("Trade Deal: " + statusString)
        .addField("Side 1", `${sideString[0]}`, true)
        .addField("Side 2", `${sideString[1]}`, true)

    channel.send({ embeds: [embed] });
}