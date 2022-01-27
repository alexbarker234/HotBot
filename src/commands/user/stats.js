const { MessageEmbed } = require('discord.js');
const f = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'stats',
    description: 'view your stats',
    usage:  `!stats
            "!stats detailed`,
    async execute(client, message, args, user, userStats){  
        if (args[0] != "detailed") {
            let statList = `**egg chance:** ${f.fixFPErrors(userStats.eggChance * 100)}%\n` +
                            `**egg message cooldown:** ${userStats.eggCD}m\n`+
                            `**egg slots:** ${userStats.eggSlots}\n`+
                            `**egg hatch speed:** ${f.fixFPErrors(userStats.eggHatchSpeed * 100)}%\n`+

                            `**fish chance:** ${f.fixFPErrors(userStats.fishChance * 100)}%\n`+
                            `**bonus fish chance:** ${f.fixFPErrors(userStats.bonusFishChance * 100)}%\n`+
                            `**rare fish influence:** ${f.fixFPErrors(userStats.rareFishScale * 100)}%\n`+
                            `**chest fish chance:** ${f.fixFPErrors(userStats.chestChance * 100)}%\n`+
                            `**artifact fish chance:** ${f.fixFPErrors(userStats.artifactChance * 100)}%\n`+
                            
                            `**garden plots:** ${userStats.gardenPlots}\n`+
                            `**garden water need:** ${f.fixFPErrors(userStats.gardenWaterNeed * 100)}%\n`+
                            `**garden growth rate:** ${f.fixFPErrors(userStats.gardenGrowthRate* 100)}%\n`

            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle(message.author.username + "'s stats")
                .addField("stats", statList, true);
            message.channel.send({ embeds: [embed] });
        }
        else {
            const embed = new MessageEmbed()
                .setColor('#63eb65')
                .setTitle(message.author.username + "'s stats")
                .addField(`egg chance: ${f.fixFPErrors(userStats.eggChance * 100)}%`, `${userStats.eggChanceText}`)
                .addField(`egg message cooldown: ${userStats.eggCD}m`, `${userStats.eggCDText}`)
                .addField(`egg slots: ${userStats.eggSlots}`, `${userStats.eggSlotsText}`)
                .addField(`egg hatch speed: ${f.fixFPErrors(userStats.eggHatchSpeed * 100)}%`, `${userStats.eggHatchSpeedText}`)

                .addField(`fish chance: ${f.fixFPErrors(userStats.fishChance * 100)}%`, `${userStats.fishChanceText}`)
                .addField(`bonus fish chance: ${f.fixFPErrors(userStats.bonusFishChance * 100)}%`, `${userStats.bonusFishChanceText}`)
                .addField(`rare fish influence: ${f.fixFPErrors(userStats.rareFishScale * 100)}%`, `${userStats.rareFishScaleText}`)
                .addField(`chest fish chance: ${f.fixFPErrors(userStats.chestChance * 100)}%`, `${userStats.chestChanceText}`)
                .addField(`artifact fish chance: ${f.fixFPErrors(userStats.artifactChance * 100)}%`, `${userStats.artifactChanceText}`)
                
                .addField(`garden plots: ${userStats.gardenPlots}`, `${userStats.gardenPlotsText}`)
                .addField(`garden water need: ${f.fixFPErrors(userStats.gardenWaterNeed * 100)}%`, `${userStats.gardenWaterNeedText}`)
                .addField(`garden growth rate: ${f.fixFPErrors(userStats.gardenGrowthRate * 100)}%`, `${userStats.gardenGrowthRateText}`);
            message.channel.send({ embeds: [embed] });
        }
    }
}   