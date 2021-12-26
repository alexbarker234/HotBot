const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'bestiary',
    description: 'see all the available creatures',
    usage: "%PREFIX%bestiary",
    async execute(client, message, args, user, userStats){                  
        let creatureText = [""];
        let textIndex = 0;
        let creaturesGot = [];
        for (const c of user.creatures) creaturesGot.push(c.name);
        
        for (const [name, c] of client.creatures) {
            let emojiName = functions.scrambleWord(c.name) + "Black";
            //console.log(emojiName + " " + c.name);
            let creatureName = "?????";
            if (creaturesGot.includes(c.name)){
                 emojiName = c.name;
                 creatureName = c.name;
            }
            let emoji = functions.getEmojiFromName(client, emojiName);
            if (!emoji) emoji = '❌';

            let available = c.weight(client, user) != 0;
            let availableEmoji = available ? functions.getEmojiFromName(client, "check") : '❌';
            let line = `${emoji}` + `${availableEmoji}` + " **" + creatureName + "**: " + c.requirements + "\n";
            // fields cant be longer than 1024
            if ((creatureText[textIndex] + line).length > 1024) {
                textIndex++; 
                creatureText.push("");
            }
            creatureText[textIndex] += line;
        }
        const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle("bestiary");
        for (const text of creatureText) {
            embed.addField("creatures", text, true);
        }
        message.channel.send({embeds: [embed]});
    }
}   