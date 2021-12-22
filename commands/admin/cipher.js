const functions = require('../../functions.js')

module.exports = {
    name: 'cipher',
    description: 'cipher text',
    usage: "%PREFIX%cipher <text>",
    admin: true,
    async execute(client, message, args, Discord){  
        message.channel.send(functions.scrambleWord(args[0]));
    }
}   