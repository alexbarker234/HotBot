const guildSettingsModel = require('../models/guildSettingsSchema');

module.exports = async (client, Discord) =>{
    guildSettingsModel.find({} , (err, guilds) => {
        if(err) console.logger.warn(err);
        guilds.map(async guild => {
            client.prefixes.set(guild.guildID, guild.settings.prefix)
        });
    });
}