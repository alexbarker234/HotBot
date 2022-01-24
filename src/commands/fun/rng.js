module.exports = {
    name: 'rng',
    description: 'get a random number between 2 values',
    usage: "%PREFIX%rng [min] [max]",
    execute(client, message, args, user, userStats){
        if (!args[0] || !args[1]) return message.channel.send("**correct usage: **\n" + this.usage);
        let min = Number(args[0]);
        let max = Number(args[1]);
        let num = Math.floor(Math.random() * (max - min + 1) + min);
        return message.channel.send(num)
    }
}   