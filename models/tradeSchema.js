const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const tradeSchema = new mongoose.Schema({
    guildID: reqString,
    status: {type: String, required: true, default: 'Open'},
    startDate: {type: Date},
    traders: [{ userID : String, accepted: Boolean, items: [{name: String, count: Number}] }],
})

module.exports = mongoose.model('tradeMsg', tradeSchema)