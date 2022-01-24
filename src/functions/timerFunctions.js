const gardenFunctions = require("./gardenFunctions.js");
const fetch = require('node-fetch');
const fs = require('fs');
const creatureUserModel = require(global.src + '/models/creatureUserSchema');
const guildSettingsModel = require(global.src + '/models/guildSettingsSchema');
const functions = require(global.src + '/functions/functions.js');
const { MessageAttachment, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const config = require(global.appRoot + '/config.json');;

const butterflies = ["Aurelion", "Basilisk", "Hydrotherma", "Tainted Admiral"]
const colors = ["#d6af3a", "#69c765", "#4681cf", "#d63ad1"]
const links = ["https://imgur.com/YtUQWSY.png", "https://imgur.com/oNlXH3Z.png", "https://imgur.com/Rdlf8jU.png", "https://imgur.com/TWCQazQ.png"] // cant upload file, otherwise it cant be deleted with an edit

// MAIN TIMERS

exports.runTimer = async (client) => {
    updateWeatherCache(client);

    let seconds = 0;
    let repeatDelay = 20; // in seconds
    setInterval(async function () {
        seconds += repeatDelay;
        try {
            // every minute
            if (seconds % 60 == 0) {
            }
            // every 5 minutes
            if (seconds % 300 == 0) {
                updateWeatherCache(client);
            }

            // loop through each user
            creatureUserModel.find({}, (err, users) => {
                if (err) console.logger.warn(err);

                users.map(async user => {
                    // every 20 seconds
                    await checkEggHatching(client, user);
                    await clearOldBrews(client, user);
                    // every minute
                    if (seconds % 60 == 0) {
                        await updateGarden(client, user);
                    }
                    // every 5 minutes
                    if (seconds % 300 == 0) {
                    }
                    user.save();
                });
            });
            // loop through each guild
            guildSettingsModel.find({}, (err, guilds) => {
                if (err) console.logger.warn(err);

                guilds.map(async guild => {
                    // only execute if bot is in the server
                    if (client.guilds.cache.has(guild.guildID)) {
                        // every minute
                        if (seconds % 60 == 0) {
                            await traderNotification(client, guild);
                        }
                        // every 5 minutes
                        if (seconds % 300 == 0) {
                            updateWeatherCache(client);
                            await butterflyCheck(client, guild);
                        }
                        guild.save();
                    }
                });
            });
        }
        catch (err) { console.logger.error(err); }
    }, 1000 * repeatDelay)
}
// trader alerts

async function traderNotification(client, guild) {
    let channel = await functions.getAlertChannel(client, guild.guildID, "event")
    var date = Date.nowWA();
    if (date.getDay() == config.gobbyTraderDay) {
        if (!guild.sentAlert.gobbyTrader) {
            console.log("sending gobby trader notification");

            const image = new MessageAttachment(`./assets/GobbyTrader.png`, 'trader.png');
            const embed = new MessageEmbed()
                .setColor('#84d997')
                .setTitle("gobby trading boat")
                .setDescription(`a gobby trading boat has docked! do **!shop gobby** to see what they have in stock!`)
                .setImage('attachment://trader.png')
            channel.send({ embeds: [embed], files: [image] });

            guild.sentAlert.gobbyTrader = true;
        }
    }
    else {
        if (guild.sentAlert.gobbyTrader) {
            const embed = new MessageEmbed()
                .setColor('#666c73')
                .setTitle("gobby trading boat")
                .setDescription(`the gobby trading boat has departed 👋`)
            channel.send({ embeds: [embed] });

            guild.sentAlert.gobbyTrader = false;
        }
    }
}

// butterflies
async function butterflyCheck(client, guild) {
    if (!guild) return console.logger.warn("theres no guild in butterflyCheck for some reason?");
    if (Math.random() < 0.05) { // roughly 14 butterflies a day: (1440 / 5) * 0.05             
        let channel = await functions.getAlertChannel(client, guild.guildID, "event")
        if (channel) {
            console.log("attempting butterfly spawn for " + guild.guildID)
            spawnButterfly(client, channel)
        }
    }
}
var spawnButterfly = exports.spawnButterfly = async (client, channel) => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('start')
                .setEmoji('🦋')
                .setLabel('catch butterfly!')
                .setStyle('PRIMARY')
        )

    const choice = Math.floor(Math.random() * butterflies.length);
    const butterfly = butterflies[choice];

    const embedAppear = new MessageEmbed()
        .setColor(colors[choice])
        .setTitle("butterfly!")
        .setDescription(`✨ a ${butterfly} butterfly has appeared ✨`)
        .setImage(links[choice]);

    const embedFlyAway = new MessageEmbed()
        .setColor('#666c73')
        .setTitle("butterfly...")
        .setDescription(`the butterfly has flown away :(`);

    let butterflyMessage = await channel.send({
        embeds: [embedAppear],
        components: [row]
    })

    let usersClicked = [];

    const filter = (i) => !usersClicked.includes(i.user.id) && i.message.id === butterflyMessage.id;
    const collector = channel.createMessageComponentCollector({
        filter,
        time: 3 * 60 * 1000
    })
    collector.on('collect', async i => {
        try {
            usersClicked.push(i.user.id);

            let user = await functions.getUser(i.user.id, i.guildId);
            if (!user) return console.error("couldnt find profile for butterfly catch");

            let rewards = await functions.chooseButterflyRewards(client, user, true)

            let rewardString = "**Items:**\n";
            for (item of rewards.itemRewards) {
                let emoji = functions.getEmojiFromName(client, item.name, '');
                rewardString += `${emoji}${item.name} **x${item.count}**\n`;
            }
            if (rewards.boostRewards.length != 0) rewardString += "**Boosts:**\n";
            for (boost of rewards.boostRewards) {
                if (boost.name != "Blessing of the Dryad")
                    rewardString += `${boost.name}\n`;
                else
                    rewardString += `Blessing of the Dryad - all your plants have grown by 10%! \n`;
            }
            user.stats.butterfliesCaught++;
            const embed = new MessageEmbed()
                .setColor('#69c765')
                .setTitle("you caught a butterfly!")
                .setDescription(rewardString);

            i.reply({ embeds: [embed], ephemeral: true })
            user.save();
        }        
        catch (err) { console.logger.error(err); }
    });
    collector.on('end', collected => {
        butterflyMessage.edit({ embeds: [embedFlyAway], components: [], files: [] })
    });
}
// creatures

async function checkEggHatching(client, user) {
    let toRemove = [];
    // loop through each egg
    for (const egg of user.eggs) {
        const userStats = await functions.getUserStats(client, user.userID, user.guildID);
        const speedScale = 1 - (userStats.eggHatchSpeed - 1);
        if ((new Date).getTime() - egg.obtained.getTime() > egg.hatchTime * speedScale) {
            toRemove.push(user.eggs.indexOf(egg));

            functions.addThingToUser(user.creatures, egg.name, 1);

            // send notification if enabled
            const time = Date.nowWA();
            if (user.settings.eggNotifs && ((time.getHours() >= 21 || time.getHours() <= 7) || user.settings.nightNotifs))
                functions.sendAlert(client, `<@!${user.userID}>! your ${egg.name} has hatched!`, user.guildID)

            // log
            let discordMember = await client.users.cache.get(user.userID);
            let username = discordMember ? discordMember.username : user.userID;
            console.logger.warn(`hatched ${username}'s ${egg.name} egg`);
            //logCreatureGame(`hatched ${user.userID}'s ${egg.name} egg. they now have\n`);            
        }
    }
    // remove hatched eggs from egg array
    for (let i = toRemove.length - 1; i >= 0; i--) { // go backwards to not mess up indexing
        if (toRemove[i] > -1) user.eggs.splice(toRemove[i], 1); // removes 1 element from index
    }
}

// brewing

function clearOldBrews(client, user) {
    if (user.brew.started && Date.now() - user.brew.started.getTime() > config.brewExpiry) {
        user.brew.started = null;
        user.brew.steps = [];
        functions.sendAlert(client, `<@!${user.userID}>! your brew has expired D:`, user.guildID)
    }
}

// garden

async function updateGarden(client, user) {
    let waterAlertedAlready = false;
    let waterAlert = false;
    let grownAlertedAlready = false;
    let grownAlert = false;
    const userStats = await functions.getUserStats(client, user.userID, user.guildID);
    for (const plant of user.garden.plants) {
        if (plant.name == "none") continue;
        let plantData = client.plants.get(plant.name);

        // dont send notif if already sent before
        if (plant.sentWaterNotif) waterAlertedAlready = true;
        if (plant.sentWaterNotif) grownAlertedAlready = true;

        // update
        await gardenFunctions.updatePlantWater(client, user, plant);
        if (plant.name == "none") continue; // if it dies

        if (gardenFunctions.calculateWaterPercent(plant, userStats, plantData) == 0 && !plant.sentWaterNotif) {
            plant.sentWaterNotif = true;
            waterAlert = true;
        }
        if (gardenFunctions.calculateGrowthPercent(plant, userStats, plantData) == 1 && !plant.sentGrownNotif) {
            plant.sentGrownNotif = true;
            grownAlert = true;
        }
    }
    if (waterAlert && !waterAlertedAlready && user.settings.notifs && user.settings.waterNotifs) functions.sendAlert(client, `<@!${user.userID}>! your plants are dehydrated!`, user.guildID)
    if (grownAlert && !grownAlertedAlready && user.settings.notifs && user.settings.growthNotifs) functions.sendAlert(client, `<@!${user.userID}>! your plants are grown!`, user.guildID)
}

// weather
async function updateWeatherCache(client) {
    const url = 'http://api.openweathermap.org/data/2.5/weather?q=Perth&appid=' + process.env['WEATHERTOKEN'];
    let weather = await fetch(url)
    let weatherJSON = await weather.json();
    let weatherData = {
        weather: weatherJSON.weather[0].main,
        temperature: weatherJSON.main.temp - 273.15,
        windspd: weatherJSON.wind.speed,
        clouds: weatherJSON.clouds.all
    }
    client.weatherCache = weatherData;
}