const functions = require(global.src + '/functions/functions.js');;

module.exports = {
    name: 'use',
    description: 'use an item',
    usage: "!use <item>",
    async execute(client, message, args, user, userStats){          
        let itemName = args.join(' ');

        let itemToUse;
        for (const [key, value] of Object.entries(user.inventory)) {
            if (itemToUse) break;
            for (const item of user.inventory[key]){
                if (item.name == itemName){
                    itemToUse = item;
                    break;
                }
            }
        }    
        if (!itemToUse) return message.channel.send("you dont have that item")
        let itemData = functions.getItem(client, itemToUse.name)
        if (!itemData.consumable) return message.channel.send(`you cant use ${itemToUse.name}`)

        if (itemData.type == "potions") {
            if(!functions.addBoost(client, user, itemToUse.name)) return message.channel.send("you already have that potion active!");
            functions.removeThingFromUser(user.inventory.potions, itemToUse.name, 1);
        }
        else {
            console.logger.warn(`error consuming ${itemData.name}`)
            return message.channel.send("idk what to do with this");
        }
        user.save();
    }
}   