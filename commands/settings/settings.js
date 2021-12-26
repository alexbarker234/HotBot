const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed,MessageButton, MessageActionRow, MessageSelectMenu  } = require('discord.js');
const functions = require('../../functions.js')

let settingsMap = new Map();
settingsMap.set("notifs", {display: "Notifications", description: "Toggle HotBot sending any notifications"})
settingsMap.set("eggNotifs", {display: "Egg Notifications", description: "Toggle HotBot alerting you when one of your egg hatches"})
settingsMap.set("waterNotifs", {display: "Dehydration Notifications", description: "Toggle HotBot alerting you when your plants are dehydrated"})
settingsMap.set("witherNotifs", {display: "Wither Notifications", description: "Toggle HotBot alerting you when one of your plants withers"})
settingsMap.set("growthNotifs", {display: "Growth Notifications", description: "Toggle HotBot alerting you when one of your plants grows"})
settingsMap.set("nightNotifs", {display: "Night Notifications", description: "Toggle whether HotBot alerts you at night time"})

module.exports = {
    name: 'settings',
    description: 'view/change your user settings',
    usage: "%PREFIX%settings <setting>",
    async execute(client, message, args, user, userStats){       
        let settingInput = args.join(' ').toCaps();
        if (args[0]) {
            let settingName;
            for (const [setting, value] of Object.entries(user.settings)) {
                let settingsData = settingsMap.get(setting);
                if (setting == args[0] || settingsData.display == settingInput) { settingName = setting; break;}
            }
            if (!settingName) return message.channel.send("that setting doesn't exist")

            booleanSetting(message.channel, settingName, message.author.id, user)              
        }
        else {
            let settingsDropdown = [];
            let settingsText = "";
            for (const [setting, value] of Object.entries(user.settings)) {
                let settingsData = settingsMap.get(setting);
                settingsText += `**${settingsData.display}**: ${settingsData.description}\n- ${user.settings[setting]}\n`;
                settingsDropdown.push({
                        label: settingsData.display,
                        description: settingsData.description,
                        value: setting,
					})
            }
            
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.author.username + "'s settings")
                .addField("settings", settingsText, true);
                
            const row = new MessageActionRow()
			.addComponents(
                new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(settingsDropdown)
            )
            const row2 = new MessageActionRow()
			.addComponents( 
                new MessageButton()
                    .setCustomId(`exit`)
                    .setLabel('exit')
                    .setStyle('DANGER')
            )
            let settingsMsg = await message.channel.send({
                embeds: [embed], 
                components: [row, row2]
            });  
            
            const filter = (i) => i.user.id === message.author.id;
            const collector = message.channel.createMessageComponentCollector({
                filter,
                idle: 60 * 1000
            })
            collector.on('collect', async i => {  
                if (i.customId === 'select') {
                    let user = await functions.getUser( i.user.id, i.guildId);
                    if (!user) return i.reply("can't find profile");

                    if (typeof user.settings[i.values[0]] == "boolean") 
                        booleanSetting(i.channel, i.values[0], i.user.id, user)              
                }
                collector.stop();
            });   
            collector.on('end', collected => {
                settingsMsg.delete();
            });   
        }
    }
}

async function booleanSetting(channel, setting, userID, user) {
    let settingsData = settingsMap.get(setting);
    const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(settingsData.display)
        .setDescription(settingsData.description)
        .addField("current value", `${user.settings[setting]}`)

        const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId(`true`)
            .setLabel('true')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`false`)
            .setLabel('false')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`exit`)
            .setLabel('exit')
            .setStyle('DANGER')
    )

    let settingsMsg = await channel.send({embeds: [embed], components: [row]})

    const filter = (i) => i.user.id === userID;
    const collector = channel.createMessageComponentCollector({
        filter,
        idle: 60 * 1000
    })
    collector.on('collect', i => {  
        if (i.customId === 'true' || i.customId === 'false') {      
            user.settings[setting] = i.customId === 'true';
            user.save();
            i.reply({content: `${settingsData.display} updated to ${i.customId}`, ephemeral: true})
        }
        collector.stop();
    });   
    collector.on('end', collected => {
        settingsMsg.delete();
    }); 
}