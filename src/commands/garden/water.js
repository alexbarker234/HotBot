const gardenFunctions = require(global.src + '/functions/gardenFunctions.js')

module.exports = {
    name: 'water',
    description: 'water a plant',
    usage: `%PREFIX%water <plot>`,
    async execute(client, message, args, user, userStats){
        gardenFunctions.fixDefaultGarden(user);

        let plot = parseInt(args[0]);
        if (isNaN(plot)) return message.channel.send("huh thats not a number");
        else if (plot <= 0) return message.channel.send(`what.`)
        else if (plot > userStats.gardenPlots) return message.channel.send(`you dont have ${plot} plots`)
        plot -= 1;
        let plant = user.garden.plants[plot];
        if (plant.name == "none") return message.channel.send(`plot ${plot + 1} is empty`)

        await gardenFunctions.updatePlantWater(client, user, plant);

        plant.lastWatered = new Date();
        plant.sentWaterNotif = false;

        user.save();    

        message.channel.send(`successfully watered ${plant.name} in plot ${plot + 1}`)
    }
}   