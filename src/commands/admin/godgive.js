const creatureUserModel = require(global.src + '/models/creatureUserSchema')
const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'godgive',
    description: 'give someone a thing',
    usage: "%PREFIX%godgive item [user] [subinv] [count] [name]\n"
        + "%PREFIX%godgive egg [user] [name]\n"
        + "%PREFIX%godgive creature [user] [count] [name]\n"
        + "%PREFIX%godgive flarins [user] [amount]\n"
        + "%PREFIX%godgive boost [user] [name]",
    admin: true,
    async execute(client, message, args, user, userStats){  
        if (!args[1]) return message.channel.send("incorrect usage");
        args[1] = args[1].replace(/[\\<>@#&!]/g, "");
        
        let userToGive = await functions.getUser(args[1], message.guild.id);
        if (!userToGive) return message.channel.send("can't find profile");

        // ITEM

        if (args[0] == "item") {
            if (!args[4]) return message.channel.send("incorrect usage");
            if(!userToGive.inventory[args[2]]) return message.channel.send('that subinv doesnt exist')

            let itemName = args.slice(4).join(' ').toCaps();
            functions.addThingToUser(userToGive.inventory[args[2]], itemName, args[3]);

            message.channel.send(`given <@!${args[1]}> ${args[3]} ${itemName}`)
        }

        // EGG

        else if (args[0] == "egg") {
            if (!args[2]) return message.channel.send("incorrect usage");
            let eggName = args.slice(2).join(' ').toCaps();
            const egg = client.creatures.get(eggName);
            if (!egg) return console.logger.warn(`couldnt find ${eggName}`);

            const eggData = {name : eggName, obtained : new Date(), hatchTime : egg.hatchTime }
            userToGive.eggs.push(eggData);

            message.channel.send(`given <@!${args[1]}> ${eggName}`);
        }

        // CREATURE

        else if (args[0] == "creature") {
            if (!args[3]) return message.channel.send("incorrect usage");
            let creatureName = args.slice(3).join(' ').toCaps();
            if (!client.creatures.get(creatureName)) return console.logger.warn(`couldnt find ${creatureName}`);

            functions.addThingToUser(userToGive.creatures, creatureName, parseInt(args[2]));

            message.channel.send(`given <@!${args[1]}> ${args[2]} ${creatureName}`);
        }

        // FLARINS

        else if (args[0] == "flarins") {
            if (!args[2]) return message.channel.send("incorrect usage");
            userToGive.flarins += parseInt(args[2]);

            message.channel.send(`given <@!${args[1]}> ${args[2]} flarins`);
        }

        // BOOST

        else if (args[0] == "boost") {
            if (!args[2]) return message.channel.send("incorrect usage");

            let boostName = args.slice(2).join(' ').toCaps();
            if (!client.boosts.get(boostName)) return message.channel.send(`couldnt find ${boostName}`);

            if(functions.addBoost(client, userToGive, boostName)) 
                message.channel.send(`boosted <@!${args[1]}> with ${boostName}`);
            else message.channel.send(`<@!${args[1]}> already has ${boostName}`);
        }
        userToGive.save()
    }
}   