const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'creatures',
    description: 'see what creatures you got',
    usage: "%PREFIX%creatures <creature>",
    async execute(client, message, args, user, userStats){     
        if (user.creatures.length == 0) return message.channel.send("you have no creatures");
        
        if (args[0]) {
            let creature;
            for (const c of user.creatures) {
                if (c.name.toLowerCase() == args[0].toLowerCase()) creature = c;
            }
            if (!creature) return message.channel.send("you dont own that creature");

            const creatureFile = client.creatures.get(creature.name);
            const creatureImage = new MessageAttachment(`./assets/creatures/${creatureFile.name}.png`, 'creature.png');

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(creatureFile.name)
                .setImage('attachment://creature.png')
                .addField("description", creatureFile.desc == "" ? "description not written" : creatureFile.desc, true)
                .addField("count", `${creature.count}`, true);
            message.channel.send({ embeds: [embed], files: [creatureImage] });
        }
        else {
            let creatureText = "";
            let total = 0;
            for (const c of user.creatures) {
                let emoji = functions.getEmojiFromName(client, c.name);
                creatureText += `${emoji}` + " " + c.name + ": ***" + c.count + "***\n";
                total += c.count;
            }

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.author.username + "'s creatures")
                .addField("creatures", creatureText, true)
                .addField("total", `${total}`, true)
            message.channel.send({embeds: [embed]});
        }
    }
}   