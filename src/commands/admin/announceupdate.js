const guildSettingsModel = require(global.src + '/models/guildSettingsSchema');
const fs = require('fs');
const functions = require(global.src + '/functions/functions.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'announceupdate',
    description: 'announce an update',
    usage: "%PREFIX%announceupdate <version>",
    admin: true,
    async execute(client, message, args, user, userStats) {
        let logs = fs.readdirSync(global.src + '/changelogs/')
        logs = logs.map(x => x.replaceAll(".txt", ""))

        if (!args[0]) return message.channel.send("specify changelog to send");
        if (args[0].charAt(0) != "v") args[0] = "v" + args[0];
        if (!logs.includes(args[0])) return message.channel.send("changelog doesnt exist")
        file = args[0];

        var data = fs.readFileSync(global.src + `/changelogs/${file}.txt`, 'utf8');

        const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(`HotBot ${file.replace(".txt", "")}`)
        .setDescription(data.toString())

        guildSettingsModel.find({}, (err, guilds) => {
            if (err) console.logger.error(err);

            guilds.map(async guild => {
                // only execute if bot is in the server
                if (client.guilds.cache.has(guild.guildID)) {
                    let channel = await functions.getAlertChannel(client, guild.guildID, "alert")
                    channel.send({embeds: [embed]});
                }
            });
        });
    }
}   