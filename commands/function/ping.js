module.exports = {
    name: 'ping',
    description: 'ping the bot. may bite',
    usage: "%PREFIX%ping",
    hidden: true,
    execute(client, message, args, user, userStats){
        message.channel.send('heyya cutie :)');
        console.log("someone pinged me");
    }
}