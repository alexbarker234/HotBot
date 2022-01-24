const tFunctions = require(global.src + '/functions/timerFunctions.js');

module.exports = {
    name: 'butterflytest',
    description: 'add to the todo list',
    usage: "%PREFIX%butterflytest",
    admin: true,
    async execute(client, message, args, user, userStats){
        tFunctions.spawnButterfly(client, message.channel);
    }
}   