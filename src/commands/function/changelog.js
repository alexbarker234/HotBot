const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'changelog',
    description: 'get the changelog for a version',
    usage: "%PREFIX%changelog [version]\n"
        + "%PREFIX%changelog list",
    execute(client, message, args, user, userStats){
        let logs = fs.readdirSync(global.src + '/changelogs/')
        if (args[0] == "list") {
            let logString = "";
            for (const log of logs) 
                logString += log.replace(".txt", "") + "\n";
            
            const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle('changelogs')
            if (logString != "") embed.setDescription(logString)
            message.channel.send({embeds: [embed]});
        }
        else {
            logs = logs.map(x => x.replaceAll(".txt", ""))
            let file = logs.reduce((a, b) => 0 < a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) ? a : b); // get latest vers
            if (args[0]) {
                if (args[0].charAt(0) != "v") args[0] = "v" + args[0];
                if (!logs.includes(args[0])) return message.channel.send("changelog doesnt exist")
                file = args[0];
            }
            var data = fs.readFileSync(global.src + `/changelogs/${file}.txt`, 'utf8');
            const embed = new MessageEmbed()
            .setColor('#f0c862')
            .setTitle(`HotBot ${file.replace(".txt", "")}`)
            .setDescription(data.toString())
            message.channel.send({embeds: [embed]});
        }
    }
}