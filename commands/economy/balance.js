const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'balance',
    description: 'check how poor you are',
    usage: "%PREFIX%balance\n"
        + "%PREFIX%balance top",
    alt: 'flarins',
    async execute(client, message, args, user, userStats){  
        let flarinEmoji = functions.getEmojiFromName(client, "flarin", '💰');

        if (args[0] != "top") {
            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle(message.author.username + "'s balance")
                .addField("balance", `${user.flarins}${flarinEmoji}`, true);
            message.channel.send({ embeds: [embed] });
        }
        else {

            let balanceMap = new Map();

            await creatureUserModel.find({} , (err, users) => {
                if(err) console.log(err);
                users.map(user => {
                    if (user.flarins > 0 && user.guildID == message.guild.id)
                        balanceMap.set(user.userID, user.flarins)
                       
                });
            });
            balanceMap = balanceMap.sortMap();

            let balanceText = "";
            let count = 1;
            for (const [id, flarins] of balanceMap.entries()) {
                balanceText += `**${count}.** <@!${id}>: ${flarins}${flarinEmoji}\n`
                count++;
            }
            
            if (balanceText == "") balanceText = "ur all broke";

            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle(message.guild.name + "'s flarin leaderboard")
                .addField("leaderboard", balanceText);
            message.channel.send({ embeds: [embed] });
        }
    }
}   