const functions = require('../../functions.js')
const cf = require('../../creatureFunctions.js')
const creatureUserModel = require('../../models/creatureUserSchema');

module.exports = async (Discord, client, message) => {
    let prefix = functions.getPrefix(client, message.guildId);

    // find user - create if doesnt exist
    // NOTE- may be bad fetching from db every time, perhaps change to when the prefix is detected or when egg roll is needed
    let user = await functions.getUser(message.author.id, message.guild.id)
    if (!user) {
        let profile = await creatureUserModel.create({
            userID: message.author.id,
            guildID: message.guild.id,
            lastMsg: 0
        });
        profile.save();
        user = await creatureUserModel.findOne({userID: message.author.id, guildID: message.guild.id});
    }
    const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);

    // egg stuff 
    if (!message.author.bot) cf.checkEgg(client, user, userStats, message);

    // responses   
    if (message.content.toLowerCase().startsWith("marco") &&
        Math.floor(Math.random() * 5) == 0) return message.channel.send("polo from :sparkles:the internet:sparkles:");

    // commands
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/); // splits the commands at the spaces eg !dig potato > "dig", "potato"
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (!command) return message.reply("i don't know that command :(");

    if (command.admin && message.author.id != '283182274474672128' && message.author.id != '902830379629707314') return;

    try {
        command.execute(client, message, args, user, userStats);
    }
    catch (err) {
        message.reply("error executing command. sorry lmao can't code.");
        console.log(err);
    }
}
