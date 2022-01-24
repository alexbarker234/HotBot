const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'boosts',
    description: 'view your active boosts',
    usage: "!boosts",
    async execute(client, message, args, user, userStats){  
        let boostList = "";

        for (const boost of user.boosts) {
            let boostData = client.boosts.get(boost.name);
            if (!boostData) boostData = client.potions.get(boost.name);
            if (!boostData) {console.logger.warn(`couldnt find ${boost.name} data`); continue;}
            if (Date.now() - boost.used < boostData.duration) {
                boostList += `**${boostData.name}**\n`
                            + `❓${boostData.effect}\n`
                            + `🕓${new Date(boostData.duration - (Date.now() - boost.used)).toCountdown()} remaining\n`
            }
        }

        if (boostList == "") boostList = "none";
        const embed = new MessageEmbed()
            .setColor('#80ede6')
            .setTitle(message.author.username + "'s boosts")
            .addField("boosts", boostList, true);
        message.channel.send({ embeds: [embed] });
    }
}   