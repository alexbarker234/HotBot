const mongoose = require('mongoose')

// so we dont have to type x: {type: string, etc}
const reqString = {
    type: String,
    required: true
}

const guildSettingsSchema = new mongoose.Schema({
    guildID: reqString,
    settings: {
        botChannel: { type: String, default: "-1" },
        eventChannel: { type: String, default: "-1" },
        alertChannel: { type: String, default: "-1" },
        prefix: { type: String, default: "!" },
        events: { type: Boolean, default: true },
    },
    sentAlert: {
        gobbyTrader: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema)