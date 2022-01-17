const mongoose = require('mongoose')

const Plant = new mongoose.Schema({
    name: { type: String, default: "none" },
    planted: Date,
    lastWatered: Date,
    timeUnwatered: { type: Number, default: 0 },
    lastUnwateredUpdate: Date,
    growthOffset: { type: Number, default: 0 },
    sentWaterNotif: Boolean,
    sentGrownNotif: Boolean,
});
module.exports = Plant