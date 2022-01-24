const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'help',
    description: 'get help!',
    usage: `%PREFIX%help <command>`,
    execute(client, message, args, user, userStats) {
        let prefix = functions.getPrefix(client, message.guildId);

        if (args[0]) {
            const command = client.commands.get(args[0]);
            if (!command) return message.reply("i can't help with that one D:");

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(command.name)
                .addField("description", command.description)
            if (command.usage) embed.addField("usage: <> are optional parameters", command.usage.replaceAll("%PREFIX%", prefix))

            message.channel.send({embeds: [embed]});
        }
        else {
            const titleEmojis = new Map()
            titleEmojis.set("creatures",functions.getEmojiFromName(client, "Gorb"))
            titleEmojis.set("economy",functions.getEmojiFromName(client, "flarin", '💰'))
            titleEmojis.set("fishing",functions.getEmojiFromName(client, "Deepjaw"))
            titleEmojis.set("fun", '🎲')
            titleEmojis.set("function", '🌧️')
            titleEmojis.set("garden", '🌿')
            titleEmojis.set("help", '❓')
            titleEmojis.set("user", '💁')
            titleEmojis.set("settings", '⚙️')

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle('commands')
                .setDescription(`do ${prefix}help <cmd> to get more information on that command`)
            // loop through each type of command, looping through each command and ading commands of the same type to the embed
            const commandTypes = fs.readdirSync(global.src + '/commands/').filter(file => file != "admin");       
            commandTypes.forEach(cmdType => {
                let cmdHelp = "";
                client.commands.forEach((command, key) => {
                    if (!command.admin && !command.hidden && command.alt != key && command.type == cmdType)
                        cmdHelp += `**[${command.name}](https://www.google.com "${command.description}\n\nusage:\n${command.usage.replaceAll("%PREFIX%", prefix)}")**\n`;              
                });
                if (cmdHelp != "") embed.addField(`${titleEmojis.get(cmdType)}${cmdType}`, cmdHelp, true)
            });

            message.channel.send({embeds: [embed]});
        }
    }
}