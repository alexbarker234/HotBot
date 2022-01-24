const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'upgrades',
    description: 'view your upgrades',
    usage: "!upgrades",
    async execute(client, message, args, user, userStats){          
        let upgradeList = "";

        for (const upgrade of user.upgrades) {
            let upgradeData = client.upgrades.get(upgrade.name);
            if (!upgradeData) {console.log(`couldnt find ${upgrade.name} data`); continue;}
            upgradeList += `**${upgradeData.name}** x${upgrade.count}
                            ❓${upgradeData.effect}\n`
        }

        if (upgradeList == "") upgradeList = "none";
        const embed = new MessageEmbed()
            .setColor('#e676e8')
            .setTitle(message.author.username + "'s upgrades")
            .addField("upgrades", upgradeList, true);
        message.channel.send({ embeds: [embed] });
    }
}   