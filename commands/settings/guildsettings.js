const guildSettingsModel = require('../../models/guildSettingsSchema');
const { MessageEmbed,MessageButton, MessageActionRow, MessageSelectMenu, MessageCollector, Permissions  } = require('discord.js');
const functions = require('../../functions.js')

let settingsMap = new Map();
settingsMap.set("prefix", {
    display: "Prefix", 
    description: "Toggle whether HotBot alerts you at night time",
    type: "string"
    })
settingsMap.set("events", {
    display: "Events", 
    description: "Toggle whether special events (such as butterflies) should occur on this server. Note: If a bot channel is not set, this won't do anything.",
    type: "boolean"
    })
settingsMap.set("botChannel", {
    display: "Bot Channel", 
    description: "Set the channel that HotBot will be used in. Note: commands can still be sent outside of this channel",
    type: "channelID"
    })
settingsMap.set("alertChannel", {
    display: "Alert Channel", 
    description: "Set the channel HotBot will send alerts in. Note: The bot channel is used if this is not set",
    type: "channelID"
    })
settingsMap.set("eventChannel", {
    display: "Event Channel", 
    description: "Set the channel HotBot will send event notifications in. Note: The bot channel is used if this is not set",
    type: "channelID"
    })

module.exports = {
    name: 'guildsettings',
    description: 'view/change your guild settings',
    usage: "%PREFIX%guildsettings <setting> <value>",
    async execute(client, message, args, user, userStats){       
        if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) 
            return message.channel.send("you arent an admin :(");

        let guild = await functions.getGuild(message.guild.id)
        if (!guild) return message.channel.send("error getting profile :(");
        
        let settingInput = args.join(' ').toCaps();
        if (args[0]) {
            let settingName;
            for (const [setting, value] of Object.entries(guild.settings)) {
                let settingsData = settingsMap.get(setting);
                if (setting == args[0] || settingsData.display == settingInput) { settingName = setting; break;}
            }
            if (!settingName) return message.channel.send("that setting doesn't exist")

            booleanSetting(message.channel, settingName, message.author.id, guild)              
        }
        else {
            let settingsDropdown = [];
            let settingsText = "";
            for (const [setting, value] of Object.entries(guild.settings)) {
                let settingsData = settingsMap.get(setting);
                settingsText += `**${settingsData.display}**: ${settingsData.description}\n- ${guild.settings[setting]}\n`;
                settingsDropdown.push({
                        label: settingsData.display,
                        value: setting,
					})
            }
            
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.guild.name + "'s settings")
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
            
            const filter = (i) => i.user.id === message.author.id && i.message.id === settingsMsg.id;
            const collector = message.channel.createMessageComponentCollector({
                filter,
                idle: 60 * 1000
            })
            collector.on('collect', async i => {  
                if (i.customId === 'select') {
                    let guild = await functions.getGuild(i.guildId)
                    if (!guild) return message.channel.send("error getting profile :(");

                    if (typeof guild.settings[i.values[0]] == "boolean") 
                        booleanSetting(i.channel, i.values[0], i.user.id, guild)          
                    else 
                        stringSetting(i.channel, i.values[0], i.user.id, guild)          
                }
                collector.stop();
            });   
            collector.on('end', collected => {
                settingsMsg.delete();
            });   
        }
    }
}

async function booleanSetting(channel, setting, userID, guild) {
    let settingsData = settingsMap.get(setting);
    const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(settingsData.display)
        .setDescription(settingsData.description)
        .addField("current value", `${guild.settings[setting]}`)

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

    const filter = (i) => i.user.id === userID && i.message.id === settingsMsg.id;
    const collector = channel.createMessageComponentCollector({
        filter,
        idle: 60 * 1000
    })
    collector.on('collect', i => {  
        if (i.customId === 'true' || i.customId === 'false') {      
            guild.settings[setting] = i.customId === 'true';
            guild.save();
            i.reply({content: `${settingsData.display} updated to ${i.customId}`, ephemeral: true})
        }
        collector.stop();
    });   
    collector.on('end', collected => {
        settingsMsg.delete();
    }); 
}

async function stringSetting(channel, setting, userID, guild) {
    let settingsData = settingsMap.get(setting);
    const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(settingsData.display)
        .setDescription(settingsData.description)
        .addField("current value", `${guild.settings[setting]}`)

        const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId(`change`)
            .setLabel('change')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId(`exit`)
            .setLabel('exit')
            .setStyle('DANGER')
    )

    let settingsMsg = await channel.send({embeds: [embed], components: [row]})

    const filter = (i) => i.user.id === userID && i.message.id === settingsMsg.id;
    const collector = channel.createMessageComponentCollector({
        filter,
        idle: 60 * 1000
    })
    collector.on('collect', i => {  
        if (i.customId === 'change')   
            stringCollector(channel, setting, userID, guild);
        collector.stop();
    });   
    collector.on('end', collected => {
        settingsMsg.delete();
    }); 
}

async function stringCollector(channel, setting, userID, guild) {
    let settingsData = settingsMap.get(setting);

    let settingsMsg = await channel.send("please enter the new value.")

    const filter =  m => m.author.id == userID;
    const collector = new MessageCollector(channel, filter, {
        max: 1,
        time: 15 * 1000, 
    });
    collector.on("collect", m => {
        let value = m.content;
        if (settingsData.type == "channelID") {
            value = value.replace(/[\\<>@#&!]/g, "");
            if (value.length != 18 || !/^\d+$/.test(value)) return m.channel.send("incorrect format")
        }

        guild.settings[setting] = value; 
        m.channel.send({content: `${settingsData.display} updated to ${m.content}`})
        guild.save();

        collector.stop();
    });
    collector.on('end', collected => {
        settingsMsg.delete();
    }); 
}