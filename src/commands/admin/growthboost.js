module.exports = {
    name: 'growthboost',
    description: 'boost plant growth',
    usage: "%PREFIX%growthboost <plot> <ms>",
    admin: true,
    async execute(client, message, args, user, userStats){
        let plot = parseInt(args[0]) - 1;
        let amount = parseInt(args[1]);
        user.garden.plants[plot].growthOffset += amount;
        message.channel.send(`boosted plot ${args[0]} by ${amount} ms`);

        user.save();
    }
}   