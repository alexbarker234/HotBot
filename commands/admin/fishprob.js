const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'fishprob',
    description: 'see the fish probability',
    usage: "%PREFIX%fishprob <test probability Y/N>",
    admin: true,
    execute(client, message, args, user, userStats){
        let fishText = ""
        let total = 0;
        for (const [name, fish] of client.fish) {
            if (fish.available()) total += fish.rarity();
        }
        for (const [name, fish] of client.fish) {
            if (fish.available()) fishText += fish.name + "  |  " + ((fish.rarity() / total) * 100).toFixed(2) + "  |  "  + fish.price + "\n";
        }
        message.channel.send(fishText); 
    }
}   