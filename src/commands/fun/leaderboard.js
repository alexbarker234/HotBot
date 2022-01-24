const creatureUserModel = require(global.src + '/models/creatureUserSchema')
const { MessageEmbed, MessageAttachment } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'leaderboard',
    description: 'view the different leaderboards',
    usage: "%PREFIX%leaderboard creatures <creature>\n"
        + "%PREFIX%leaderboard flarins\n"
        + "%PREFIX%leaderboard butterflies\n"
        + "%PREFIX%leaderboard fish\n",
    async execute(client, message, args, user, userStats) {
        if (args[0] == "creatures") {
            if (args[1]) {
                args[1] = args[1].toCaps()
                if (!client.creatures.get(args[1])) return message.channel.send("cant find that creature");
                creatureBoardSpecific(client, message, args[1])
            }
            else creatureBoard(client, message)
        }
        else {
            let butterfliesMap = new Map();
            let fishCaughtMap = new Map();
            let timesFishedMap = new Map();
            let currentFlarinsMap = new Map();
            let totalFlarinsMap = new Map();
            
            await creatureUserModel.find({}, (err, users) => {
                if (err) console.logger.error(err);
        
                users.map(user => {
                    if (user.guildID == message.guild.id) {
                        // butterflies
                        if (user.stats.butterfliesCaught > 0) butterfliesMap.set(user.userID, user.stats.butterfliesCaught)
                        // fish
                        if (user.stats.timesFished > 0) timesFishedMap.set(user.userID, user.stats.timesFished)
                        if (user.stats.totalFish > 0) fishCaughtMap.set(user.userID, user.stats.totalFish)
                        // flarins
                        if (user.flarins > 0) currentFlarinsMap.set(user.userID, user.flarins)
                        if (user.stats.totalFlarins > 0) totalFlarinsMap.set(user.userID, user.stats.totalFlarins)
                    }
                });
            });

            if (args[0] == "flarins") {
                let currentLeaderboard = top20String(currentFlarinsMap.sortMap());
                let totalLeaderboard = top20String(totalFlarinsMap.sortMap());
                
                const embed = new MessageEmbed()
                    .setColor('#f0c862')
                    .setTitle(message.guild.name + "'s flarin leaderboard!")
                    .addField("current flarins", currentLeaderboard != "" ? currentLeaderboard : "y'all broke")
                    .addField("lifetime flarins", totalLeaderboard != "" ? totalLeaderboard : "y'all broke");
                message.channel.send({ embeds: [embed] });
            }
            else if (args[0] == "fish") {
                let caughtLeaderboard = top20String(fishCaughtMap.sortMap());
                let fishedLeaderboard = top20String(timesFishedMap.sortMap());
                
                const embed = new MessageEmbed()
                    .setColor('#f0c862')
                    .setTitle(message.guild.name + "'s fish leaderboard!")
                    .addField("most caught", caughtLeaderboard != "" ? caughtLeaderboard : "fishless")
                    .addField("times fished", fishedLeaderboard != "" ? fishedLeaderboard : "fishless");
                message.channel.send({ embeds: [embed] });
            }
            else if (args[0] == "butterflies") {
                let leaderboard = top20String(butterfliesMap.sortMap());
    
                const embed = new MessageEmbed()
                    .setColor('#f0c862')
                    .setTitle(message.guild.name + "'s butterfly leaderboard!")
                    .addField("most caught", leaderboard != "" ? leaderboard : "no butterflies :(")
                message.channel.send({ embeds: [embed] });
            }
            else return message.channel.send("that is not a leaderboard")
        }
    }
}
async function creatureBoard(client, message) {
    let creatureMap = new Map();
    let userMap = new Map();

    await creatureUserModel.find({}, (err, users) => {
        if (err) console.log(err);

        users.map(user => {
            if (user.creatures.length > 0 && user.guildID == message.guild.id) {
                let total = 0;
                for (const creature of user.creatures) {
                    total += creature.count;

                    let map = creatureMap.get(creature.name);
                    if (map) map.count += creature.count;
                    else creatureMap.set(creature.name, { count: creature.count });
                }
                userMap.set(user.userID, total);
            }
        });
    });
    creatureMap = creatureMap.sortMapObject("count");

    let total = 0;
    let creatures = "";
    let leaderboard = top20String(userMap.sortMap());

    for (const [name, creature] of creatureMap.entries()) {
        let emoji = functions.getEmojiFromName(client, name);
        creatures += `${emoji} **${name}**: ${creature.count}\n`;
        total += creature.count;
    }
    if (creatures == "") creatures = "nothing";

    const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(message.guild.name + "'s creature statistics!")
        .addField("total creatures", `${total}`)
        .addField("leaderboard", leaderboard)
        .addField("creature counts", creatures);
    message.channel.send({ embeds: [embed] });
}
async function creatureBoardSpecific(client, message, creatureName) {
    let userMap = new Map();
    await creatureUserModel.find({}, (err, users) => {
        if (err) console.logger.error(err);

        users.map(user => {
            if (user.creatures.length > 0 && user.guildID == message.guild.id) {
                for (const creature of user.creatures) {
                    if (creature.name != creatureName) continue;
                    userMap.set(user.userID, creature.count);
                    break;
                }
            }
        });
    });

    userMap = userMap.sortMap();

    let num = 0;
    let total = 0;
    let leaderboard = "";
    for (const [userID, count] of userMap.entries()) {
        num++;
        if (num <= 20) leaderboard += `**${num}.** <@!${userID}>: ${count}\n`;
        total += count;
    }
    if (total == 0) return message.channel.send("no one has found this creature yet")

    const creatureFile = client.creatures.get(creatureName);
    const creatureImage = new MessageAttachment(`./assets/creatures/${creatureFile.name}.png`, 'creature.png');

    creatureName = creatureName.toLowerCase();
    if (leaderboard == "") leaderboard = "nothing";

    const embed = new MessageEmbed()
        .setColor('#f0c862')
        .setTitle(message.guild.name + "'s " + creatureName + " statistics!")
        .addField("total " + creatureName + "s", `${total}`)
        .addField(creatureName + " leaderboard", leaderboard)
        .setImage('attachment://creature.png');
    message.channel.send({ embeds: [embed], files: [creatureImage] });
}

function top20String(map) {
    let leaderboard = "";
    let num = 0;
    for (const [userID, count] of map.entries()) {
        num++;
        leaderboard += `**${num}.** <@!${userID}>: ${count}\n`;
        if (num >= 20) break;
    }
    return leaderboard;
}