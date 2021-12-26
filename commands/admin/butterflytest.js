const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')
const tFunctions = require('../../timerFunctions.js')

module.exports = {
    name: 'butterflytest',
    description: 'add to the todo list',
    usage: "%PREFIX%butterflytest",
    admin: true,
    async execute(client, message, args, user, userStats){
        tFunctions.spawnButterfly(client, message.channel);
    }
}   