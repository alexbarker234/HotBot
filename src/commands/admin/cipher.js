const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'cipher',
    description: 'cipher text',
    usage: "%PREFIX%cipher <text>",
    admin: true,
    async execute(client, message, args, user, userStats){  
        message.channel.send(functions.scrambleWord(args[0]));
    }
}   