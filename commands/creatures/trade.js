const tradeModel = require('../../models/tradeSchema');
const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'trade',
    description: 'create a trade request with someone',
    usage: "%PREFIX%trade create [user]\n"
    + "%PREFIX%trade add [message id] [side] [creature name] [count]\n"
    + "%PREFIX%trade remove [message id] [side] [creature name] [count]\n"
    + "%PREFIX%trade accept/reject [message id/all]",
    async execute(client, message, args, user, userStats){
        if (args[0] == "create"){
            const recieverID =  args[1].replace(/[\\<>@#&!]/g, "");

            // make sure they arent in an existing trade deal
            var inDeal = false;
            await tradeModel.find({} , (err, trades) => {
               for (const trade of trades) {    
                    if (trade.status == "Open"){
                        for (const user of trade.traders){
                            if (user.userID == message.author.id || user.userID == recieverID) {inDeal = true; break;}
                        }
                    }
                }
            })
            if (inDeal) return message.channel.send("one of you is already in another trade deal!");

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("Trade Deal: Open")
                .addField("Side 1", message.author.toString() + '\n\nnothing', true)
                .addField("Side 2", args[1] + '\n\nnothing', true)
            const tradeMsg = await message.channel.send({embeds: [embed]});
            
            embed.setFooter("id: " + tradeMsg.id);
            await tradeMsg.edit({embeds: [embed]});

            var tradeDeal = new tradeModel({
                messageID: tradeMsg.id, 
                status: 'Open', 
                traders: [
                        { userID : message.author.id, accepted : false, creatures: [] }, 
                        { userID : recieverID, accepted : false, creatures: [] }
                        ]}
                );
            tradeDeal.save();
        }



        else if (args[0] == "add" || args[0] == "remove") {           
            let creatureCount = parseInt(args[4]);

            // find trade deal
            let tradeData = await tradeModel.findOne({ messageID: args[1] });
            if (!tradeData) return message.reply("couldnt find trade deal D:")
            
            if (tradeData.status != "Open") message.channel.send("that trade deal is closed :O");

            // find trader
            let trader;
            var actuallyInTrade = false;
            for (let i = 0; i < tradeData.traders.length; i++){
                if (parseInt(args[2]) - 1== i) trader = tradeData.traders[i];
                if (message.author.id == tradeData.traders[i].userID) actuallyInTrade = true;                           
            }
            if (!actuallyInTrade) return message.reply("you arent even a part of this trade lol")
            if (!trader) return message.reply("couldnt find trader")

            // find user
            let userData = await creatureUserModel.findOne( { userID: trader.userID, guildID: message.guild.id });

            if (!userData) return message.reply("couldnt find user profile")

            // check if creature already in trade
            let creatureIndex = -1;
            for (let i = 0; i < trader.creatures.length; i++){
                if (trader.creatures[i].name == args[3]){
                    creatureIndex = i;
                    break;
                }
            }

            // check if user has enough of the creature
            if (args[0] == "add") {
                let hasCreature = false;
                for (const creature of userData.creatures) {
                    if (creature.name == args[3]){
                        hasCreature = true;
                        let creaturesLeftToTrade = creature.count;
                        if (creatureIndex != -1) creaturesLeftToTrade = creature.count - trader.creatures[creatureIndex].count;
                        if (creaturesLeftToTrade < creatureCount) {
                            creatureCount = creaturesLeftToTrade;
                            if (creatureCount != 0) message.channel.send("not enough creatured owned, " + creatureCount + " creatures added instead")
                        }
                    }
                } 
                if (!hasCreature || creatureCount == 0) return message.channel.send("no creatures to trade")
            }

            // add creature to array
            if (creatureIndex == -1) {
                const creatureData = { name : args[3], count: creatureCount }
                trader.creatures.push(creatureData);
            }
            // add to creature count
            else {
                if (args[0] == "remove") {
                    if (trader.creatures[creatureIndex].count > creatureCount) trader.creatures[creatureIndex].count -= creatureCount;
                    else trader.creatures.splice(creatureIndex, 1);
                }
                else trader.creatures[creatureIndex].count += creatureCount;
            } 
            tradeData.save();

            // edit the message
            const tradeMsg = await message.channel.messages.fetch(args[1]);

            var side1 = "";
            var side2 = "";
            for (const creature of tradeData.traders[0].creatures) 
                side1 += `${functions.getEmojiFromName(client, creature.name)}` + " " + creature.name + " ***x"+ creature.count + "***" + "\n";
            for (const creature of tradeData.traders[1].creatures) 
                side2 += `${functions.getEmojiFromName(client, creature.name)}` + " " + creature.name + " ***x"+ creature.count + "***" + "\n";

            for (const traderData of tradeData.traders) traderData.accepted = false; // make both accepts be false since the deal changed

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("Trade Deal: " + tradeData.status)
                .setFooter("id: " + args[1])
                .addField("Side 1", "<@!" + tradeData.traders[0].userID + ">" + '\n\n' + side1, true)
                .addField("Side 2", "<@!" + tradeData.traders[1].userID + ">" + '\n\n' + side2, true);

            tradeMsg.edit({embeds: [embed]});
        }



        else if (args[0] == "accept" || args[0] == "reject") {
            // find trade deal
            let tradeData = await tradeModel.findOne({ messageID: args[1] });
            if (!tradeData) return message.reply("couldnt find trade deal D:")
            
            if (tradeData.status != "Open") message.channel.send("that trade deal is closed :O");

            // find trader
            let trader;
            let traderIndex = -1;
            for (let i = 0; i < tradeData.traders.length; i++) {
                if (message.author.id == tradeData.traders[i].userID){
                    trader = tradeData.traders[i];   
                    traderIndex = i;                
                    break;
                }
            }
            if (!trader) return message.reply("you arent even a part of this trade lol");
            
            if(args[0] == "accept") trader.accepted = true;
            else tradeData.status = "rejected";

            let bothAccepted = true;
            for (const traderData of tradeData.traders) if (!traderData.accepted) bothAccepted = false;
            
            if (bothAccepted){
                console.log("trade accepted, giving creatures");

                tradeData.status = "Accepted";
                let user1 = await creatureUserModel.findOne( { userID: tradeData.traders[0].userID, guildID: message.guild.id });
                let user2 = await creatureUserModel.findOne( { userID: tradeData.traders[1].userID, guildID: message.guild.id });

                if (!user1 || !user2) return message.reply("couldnt find user profile")

                // side 1
                for (const creature of tradeData.traders[0].creatures) {
                    functions.addThingToUser(user2.creatures, creature.name, creature.count);
                    functions.removeThingFromUser(user1.creatures, creature.name, creature.count);
                } 
                // side 2
                for (const creature of tradeData.traders[1].creatures) {
                    functions.addThingToUser(user1.creatures, creature.name, creature.count);
                    functions.removeThingFromUser(user2.creatures, creature.name, creature.count);
                } 
                user1.save();
                user2.save();
                message.channel.send("trade complete!")
            } 

            let acceptanceText = ["", ""];
            if (args[0] == "reject") acceptanceText[traderIndex] = "**rejected**\n";
            for (let i = 0; i < tradeData.traders.length; i++) if (tradeData.traders[i].accepted) acceptanceText[i] = "**accepted**\n";

            let color = (bothAccepted ? '#70db7e' : (tradeData.status == "rejected" ? '#d96c7b' : '#f0c862'));

            const tradeMsg = await message.channel.messages.fetch(args[1]);

            var side1 = "";
            var side2 = "";
            for (const creature of tradeData.traders[0].creatures) side1 += creature.name + " ***x"+ creature.count + "***" + "\n";
            for (const creature of tradeData.traders[1].creatures) side2 += creature.name + " ***x"+ creature.count + "***" + "\n";

            const embed = new MessageEmbed()
                .setColor(color)
                .setTitle("Trade Deal: " + tradeData.status)
                .setFooter("id: " + args[1])
                .addField("Side 1", "<@!" + tradeData.traders[0].userID + ">" + '\n'+ acceptanceText[0] +'\n' + side1, true)
                .addField("Side 2", "<@!" + tradeData.traders[1].userID + ">" + '\n'+ acceptanceText[1] +'\n' + side2, true);

            tradeMsg.edit({embeds: [embed]});
            tradeData.save();
        }
    }
}   
