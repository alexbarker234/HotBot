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
        + "%PREFIX%trade accept/reject",
    async execute(client, message, args, user, userStats) {
        if (!args[0]) {
            let tradeData = await getTradeData(message.author.id, message.guild.id);
            if (!tradeData) return message.channel.send("you are not in an open trade deal")
            sendTradeMessage(client, tradeData, message.channel);
        }
        else if (args[0] == "create") {
            if (!args[1]) return message.channel.send("please tag a user to start a trade with")

            const receiverID = args[1].replace(/[\\<>@#&!]/g, "");
            // make sure they arent in an existing trade deal
            var inDeal = false;
            await tradeModel.find({}, (err, trades) => {
                for (const trade of trades) {
                    if (trade.status == "Open") {
                        for (const user of trade.traders) {
                            if (user.userID == message.author.id || user.userID == receiverID) { inDeal = true; break; }
                        }
                    }
                }
            })
            if (inDeal) return message.channel.send("one of you is already in another trade deal!");

            var tradeData = new tradeModel({
                guildID: message.guild.id,
                status: 'Open',
                startDate: new Date(),
                traders: [
                    { userID: message.author.id, accepted: false, items: [] },
                    { userID: receiverID, accepted: false, items: [] }
                ]
            }
            );

            sendTradeMessage(client,tradeData, message.channel);
     
            tradeData.save();
        }
        else if (args[0] == "add" || args[0] == "remove") {
            let itemCount = parseInt(args[2]);
            let itemName = args.slice(3).join(' ').toCaps();;

            if (isNaN(itemCount)) return message.channel.send(`${itemCount} is not a number`)

            // get item
            let itemData = functions.getItem(client, itemName);
            if (!itemData) return message.channel.send(`${itemName} item doesnt exist`);
            if (itemData.cantTrade) return message.channel.send(`${itemName} isnt tradable`)

            // find trade deal
            let tradeData = await getTradeData(message.author.id, message.guild.id);
            if (!tradeData) return message.channel.send("you are not in an open trade deal")

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
                let alreadyInTrade = 0;
                for (const item of tradeData.traders[side].items)
                    if (item.name == itemName) alreadyInTrade = item.count;

                let userItemCount = functions.userItemCount(user, itemName);
                if (userItemCount == 0) return message.channel.send(`${itemName} isnt tradable`)
                if (userItemCount < itemCount + alreadyInTrade) {
                    if (args[1] == "send") return message.channel.send(`you only have ${userItemCount} ${itemName} and are trying to trade ${itemCount + alreadyInTrade}`)
                    else return message.channel.send(`they only have ${userItemCount} ${itemName} and you are requesting ${itemCount + alreadyInTrade}`)
                }
                functions.addThingToUser(tradeData.traders[side].items, itemName, itemCount)
            }
            else if (args[0] == "remove") {
                functions.removeThingFromUser(tradeData.traders[side].items, itemName, itemCount)
            }
            else return message.channel.send("please specify whether you are adding or removing from the trade")

            // make both accepts be false since the deal changed
            for (const traderData of tradeData.traders) traderData.accepted = false;

            tradeData.save();

            // edit the message
            //const tradeMsg = await message.channel.messages.fetch(args[1]);

            sendTradeMessage(client, tradeData, message.channel);

        }
        else if (args[0] == "accept" || args[0] == "reject") {
            // find trade deal
            let tradeData = await getTradeData(message.author.id, message.guild.id);
            if (!tradeData) return message.channel.send("you are not in an open trade deal")

            // find trader
            let trader = tradeData.traders.find(x => x.userID == message.author.id);

            if (args[0] == "accept") trader.accepted = true;
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
                        let itemData = functions.getItem(client, item.name);  

                        let giverInv = itemData.type == "creature" ? users[i].creatures : users[i].inventory[itemData.type];
                        let receiverInv = itemData.type == "creature" ? users[1 - i].creatures : users[1 - i].inventory[itemData.type];
                        if (!giverInv || !receiverInv) return message.channel.send("error getting inventory")

                        functions.addThingToUser(receiverInv, item.name, item.count);
                        functions.removeThingFromUser(giverInv, item.name, item.count);
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
function sendTradeMessage(client, tradeData, channel, statusString, color = '#f0c862') {
    var sideString = [];
    for (const trader of tradeData.traders) {
        let itemInfo = "";
        for (const item of trader.items) 
            itemInfo += `${functions.getEmojiFromName(client, item.name, '')} ${item.name} ***x${item.count}***\n`;
        
        if (!itemInfo) itemInfo = 'nothing';
        let check = functions.getEmojiFromName(client, "check", '✅');
        sideString.push(`<@!${trader.userID}>\naccepted: ${trader.accepted ? check : '❌'}\n\n**items**\n` + itemInfo)
    }
    if (!statusString) statusString = tradeData.status
    const embed = new MessageEmbed()
        .setColor(color)
        .setTitle("Trade Deal: " + statusString)
        .addField("Side 1", `${sideString[0]}`, true)
        .addField("Side 2", `${sideString[1]}`, true)

    channel.send({ embeds: [embed] });
}