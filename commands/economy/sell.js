const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')
const fishFunctions = require('../../fishFunctions.js')

module.exports = {
    name: 'sell',
    description: 'sell items',
    usage: "%PREFIX%sell <item name> [amount]\n"
        + "%PREFIX%sell fish",
    async execute(client, message, args, user, userStats){  
        let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');

        if (!args[0]) {
            if (Math.random() < 0.1) {
                user.flarins++;
                user.save();

                return message.channel.send("you tryna sell air or somethin? fine. 1 flarin");
            }
            else return message.channel.send("you tryna sell air or somethin?");
        }

        // sell all fish
        if (args[0] == "fish") {
            let total = 0;
            if (user.inventory.fish.length == 0) return message.channel.send("you are fishless");
            for (fish of user.inventory.fish) {
                let fishData = client.fish.get(fish.name);
                if (!fishData) return console.log("error getting fish");
                total += fishData.price * fish.count;
            }
            user.inventory.fish = [];

            user.flarins += total;
            user.save();
            message.channel.send(`you sold all your fish for ${total}${flarinEmoji}\nyour current balance is now ${user.flarins}${flarinEmoji}`)
        }
        // sell one kind
        else {
            let itemName = args[0];
            let amount = 1;

            if (!isNaN(parseInt(args[args.length- 1]))) {
                amount = parseInt(args[args.length- 1]);
                for (let i = 1; i < args.length - 1; i++) itemName += " " + args[i];
            }
            else {
                for (let i = 1; i < args.length; i++) itemName += " " + args[i];
            } 

            let item;
            let itemArray;
            // loop through inventory
            for (const [key, value] of Object.entries(user.inventory)) {
                for (const invItem of user.inventory[key]) {
                    if (invItem.name == itemName){
                        itemArray = user.inventory[key];
                        item = invItem;
                    }
                }
            }
            if (!item) return message.channel.send("cant find that item");
            else if (item.cantSell) return message.channel.send("you cant sell that item!");

            if(amount > item.count) amount = item.count;

            let itemData = client.fish.get(item.name);
            if (!itemData) itemData = functions.getItem(client, itemName);
            if (!itemData) return console.log("error getting item");

            let discount = 1;
            if (!itemData.cantBuy && !itemData.fish) discount *= 0.8;
            if (itemData.sellScale) discount *= itemData.sellScale;

            let value = Math.floor(itemData.price * amount * discount);
            user.flarins += value;

            functions.removeThingFromUser(itemArray, item.name, amount)

            user.save();
            message.channel.send(`you sold ${amount} ${itemData.name} for ${value}${flarinEmoji}.\nyour current balance is now ${user.flarins}${flarinEmoji}`)
        }
    }
}   