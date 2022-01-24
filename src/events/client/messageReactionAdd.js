const Database = require("@replit/database");
const db = new Database();
const functions = require(global.src + '/functions/functions.js');

module.exports = async (Discord, client, reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    db.get(reaction.message.id).then(async k => { 
        if (k) {     
            functions.managePlanReactions(reaction);
        } 
    }).catch(() => { })
}