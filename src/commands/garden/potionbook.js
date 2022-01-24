const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

let heat = ['cold', 'cool', 'lukewarm', 'hot', 'bubbling', 'boiling', 'evaporated']

module.exports = {
    name: 'potionbook',
    description: 'water a plant',
    usage: "%PREFIX%potionbook page",
    async execute(client, message, args, user, userStats) {
        let potionsPerPage = 2;
        let potionNum = 0;
        let potions = []
        let potionTexts = []
        for (const [name, potion] of client.potions) {
            if (!potion.hideInBook) {
                potionNum++;
                potions.push(name)

                let potionText = "`description`:\n" + (potion.desc == '' ? `a potion` : potion.desc) + "\n";
                potionText += "`effect:\n`" + `${potion.effect} for ${new Date(potion.duration).toCountdown()}\n`
                let steps = potion.steps.split('-');
                let stepString = "";
                for (let i = 0; i < steps.length; i++) {
                    if (heat.includes(steps[i])) stepString += `**${i + 1}.** heat until ${steps[i]}\n`
                    else stepString += `**${i + 1}.** ${steps[i]}\n`
                }

                potionText += "`method:\n` " + stepString + "\n"
                potionTexts.push(potionText)
            }
        }

        let maxPages = potionNum / potionsPerPage;
        let page = 1;
        if (!isNaN(parseInt(args[0]))) page = parseInt(args[0]);
        if (page > maxPages) page = maxPages;

        let buttons = [];

        for (let i = 1; i <= maxPages; i++) {
            buttons.push(new MessageButton()
                .setCustomId(`${i}`)
                .setLabel('page ' + i)
                .setStyle('PRIMARY')
            )
        }

        const row = new MessageActionRow()
        for (let i = 0; i < buttons.length; i++) {
            if (i != page - 1) row.addComponents(buttons[i].setDisabled(false))
            else row.addComponents(buttons[i].setDisabled(true))
        }

        let embeds = [];
        for (let i = 0; i < maxPages; i++) {
            embeds[i] = new MessageEmbed()
                .setColor('#80ede6')
                .setTitle("the potion book: page " + (i + 1))
                .addField("commands", "!brew\n!brew add <amount> <plant/fish>\n!brew heat/stir/beat/fold\n!brew complete")
            for (let j = i * potionsPerPage; j < (i + 1) * potionsPerPage; j++) {
                if (j > potionNum) break;
                embeds[i].addField(potions[j], potionTexts[j], true)
            }
        }

        let book = await message.channel.send({
            embeds: [embeds[page - 1]],
            components: [row]
        });

        const filter = (i) => i.user.id === message.author.id && i.message.id == book.id;
        const collector = message.channel.createMessageComponentCollector({
            filter,
            idle: 60 * 1000
        })
        collector.on('collect', i => {
            try {
                page = i.customId;
                const row = new MessageActionRow()
                for (let i = 0; i < buttons.length; i++) {
                    if (i != page - 1) row.addComponents(buttons[i].setDisabled(false))
                    else row.addComponents(buttons[i].setDisabled(true))
                }

                i.message.edit({
                    embeds: [embeds[i.customId - 1]],
                    components: [row]
                });

                i.deferUpdate();
            }
            catch (err) { console.logger.error(err); }
        });
        collector.on('end', collected => {
            const row = new MessageActionRow()
            for (let i = 0; i < buttons.length; i++)
                row.addComponents(buttons[i].setDisabled(true))
            book.edit({ components: [row] })
        });
    }
}   