const creatureUserModel = require(global.src + '/models/creatureUserSchema')
const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');;

module.exports = {
    name: 'buy',
    description: 'purchase an item from the store',
    usage: "%PREFIX%buy <item name> <amount>",
    async execute(client, message, args, user, userStats){ 
        if (!args[0]) return message.channel.send("**correct usage: **\n" + this.usage);

        let itemName = args[0];
        let amount = 1;
        let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');

        // potential better way to do this: check if the string contains any item name, then check if the last arg is not included in the item name, if yes then make that the amount
        if (!isNaN(parseInt(args[args.length- 1]))) {
            amount = parseInt(args[args.length- 1]);
            for (let i = 1; i < args.length - 1; i++) itemName += " " + args[i];
        }
        else {
            for (let i = 1; i < args.length; i++) itemName += " " + args[i];
        } 
        itemName = itemName.toCaps();
        
        let item = functions.getItem(client, itemName);
        if (!item || item.cantBuy) return message.channel.send("cannot find that item in the shop");
        if (item.buyRequirements != undefined && !item.buyRequirements()) return message.channel.send("you cant buy that item right now");
        let totalPrice = item.price * amount;
        if (amount > 1 && item.type == "boosts") return message.channel.send("you cant buy multiple boosts");
        if (user.flarins < totalPrice) return message.channel.send(`you cannot afford that item. your current balance is ${user.flarins}${flarinEmoji} while ${amount} ${itemName} costs ${totalPrice}${flarinEmoji}`);

        if (item.type == "boosts") {
            if(!functions.addBoost(client, user, item.name)) return message.channel.send("you already have that boost active!");
        }  
        else if (item.type == "upgrades") {
            let alreadyGot = 0;
            for (const upgrade of user.upgrades)
                if (upgrade.name == item.name) { alreadyGot = upgrade.count; break; }
            if (alreadyGot + amount > item.max) return message.channel.send(`you can only have up to ${item.max} ${item.name}s, you currently have ${alreadyGot}`)
            functions.addThingToUser(user.upgrades, item.name, amount);
        }
        else if (item.type == "bait") {
            functions.addThingToUser(user.inventory.bait, item.name, amount);
        }        
        else if (item.type == "seeds") {
            functions.addThingToUser(user.inventory.seeds, item.name, amount);
        }
        else if (item.type == "decorations") {
            let alreadyGot = 0;
            for (const decoration of user.inventory.decorations)
                if (decoration.name == item.name) { alreadyGot = decoration.count; break; }
            if (alreadyGot + amount > item.max) return message.channel.send(`you can only have up to ${item.max} ${item.name}s, you currently have ${alreadyGot}`)
            functions.addThingToUser(user.inventory.decorations, item.name, amount);
        }
        else {
            console.logger.warn(`${item.type} buy action not defined`);
            return message.channel.send("sorry, orange code™");
        }
        user.flarins -= totalPrice;
        user.save();
        message.channel.send(`successfully bought ${amount} ${item.name} for ${totalPrice}${flarinEmoji}. your new balance is ${user.flarins}${flarinEmoji}`);

        console.log(`${message.author.username} bought ${amount} ${itemName}`);
    }
}   