const creatureUserModel = require('../../models/creatureUserSchema');
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')

module.exports = {
    name: 'plant',
    description: 'plant a seed!',
    usage: "%PREFIX%plant <plot> <seed>",
    async execute(client, message, args, user, userStats){
        gardenFunctions.fixDefaultGarden(user);

        if (!args[0] || !args[1]) return message.channel.send("**correct usage: **\n" + this.usage);

        let plantName = args[1];
        for (let i = 2; i < args.length; i++) plantName += " " + args[i];
        plantName = plantName.toCaps();

        if (!client.plants.get(plantName)) return message.channel.send(`i couldn't find ${plantName} in my plant book`);
        
        let hasPlant = false;
        for (const seed of user.inventory.seeds) 
            if (seed.name == plantName + " Seeds") {hasPlant = true; break;}
        
        if (!hasPlant) return message.channel.send(`you don't have any ${plantName} seeds :(`)

        let plot = parseInt(args[0]);
        
        if (isNaN(plot)) return message.channel.send("huh thats not a number");
        else if (plot <= 0 || isNaN(plot)) return message.channel.send(`what.`)
        else if (plot > userStats.gardenPlots) return message.channel.send(`you dont have ${plot} plots`)
        plot -= 1;
        if (user.garden.plants[plot].name != "none") return message.channel.send(`plot ${plot + 1} is already taken up by ${user.garden.plants[plot].name}`)

        user.garden.plants[plot] = {name: plantName, planted: new Date(), lastWatered: new Date(), timeUnwatered: 0, lastUnwateredUpdate: new Date()};
        functions.removeThingFromUser(user.inventory.seeds, plantName + " Seeds", 1);

        message.channel.send(`successfully planted ${plantName} in plot ${plot + 1}`)

        user.save();
    }
}   