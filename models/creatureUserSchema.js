const mongoose = require('mongoose')

// so we dont have to type x: {type: string, etc}
const reqString = {
    type: String,
    required: true
}

const Item = { name: String, count: Number }

const creatureUserSchema = new mongoose.Schema({
    userID: reqString,
    guildID: reqString,
    flarins: { type: Number, default: 0 },
    lastMsg: { type: Date },
    eggs: [{ name: String, obtained: Date, hatchTime: Number }],
    creatures: [Item],
    inventory: { // may be better to just have a giant array and seperate it later based on tags
        bait: [Item],
        seeds: [Item],
        plants: [Item],
        fish: [Item],
        potions: [Item],
        decorations: [Item],
        misc: [Item]
    },
    boosts: [{ name: String, used: Date }],
    upgrades: [Item],
    baitEquipped: String,
    brew: { started: Date, steps: [String] },
    settings: {
        notifs: { type: Boolean, default: false },
        eggNotifs: { type: Boolean, default: true },
        waterNotifs: { type: Boolean, default: true },
        witherNotifs: { type: Boolean, default: true },
        growthNotifs: { type: Boolean, default: true },
        nightNotifs: { type: Boolean, default: true }
    },
    garden: {
        plants: [{
            name: String,
            planted: Date,
            lastWatered: Date,
            timeUnwatered: Number,
            lastUnwateredUpdate: Date,
            sentWaterNotif: Boolean,
            sentGrownNotif: Boolean,
        }],
        fence: {type: String},
        path: {type: String}
    },
    stats: {
        totalFish: { type: Number, default: 0 },
        totalChests: { type: Number, default: 0 },
        timesFished: { type: Number, default: 0 },
        butterfliesCaught: { type: Number, default: 0 },
        totalFlarins: { type: Number, default: 0 }
    }

})
creatureUserSchema.pre('save', async function () {
    if (this.isModified("flarins")) {
        preSaveUser = await mongoose.model('CreatureUser', creatureUserSchema).findOne({ userID: this.userID, guildID: this.guildID });
        let flarinDiff = this.flarins - preSaveUser.flarins;
        if (flarinDiff > 0) this.set("stats.totalFlarins", flarinDiff + preSaveUser.stats.totalFlarins);
    }
});
module.exports = mongoose.model('CreatureUser', creatureUserSchema)