const { MessageEmbed } = require('discord.js');
const config = require(global.appRoot + '/config.json');
const f = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'tutorial',
    description: 'get a little tutorial on things',
    usage: "%PREFIX%tutorial <tutorial>",
    execute(client, message, args, user, userStats) {
        if (!args[0]) {         
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("tutorials")
                //.addField("setup", "how to setup hotbot")
                .addField("creatures", "a rundown on how eggs, creatures and trading works")
                .addField("fishing", "a rundown on how fishing works")
                .addField("garden", "a rundown on how gardening works")
                //.addField("brewing", "a rundown on how brewing works")
                //.addField("shop", "a rundown on how the shop works")
            message.channel.send({embeds: [embed]});
        }
        else if (args[0] == "creatures") {
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("creature tutorial")
                .addField("eggs", "every 5 minutes, you have a chance to get an egg when you send a message.\neggs take time to hatch, you can see which eggs you have and how much longer they will take with **!eggs**")
                .addField("creatures", "the mythical creatures of the ember rift each have unique descriptions and personalities.\nsome creatures are only available in certain weather, times, dates, etc. use **!bestiary** to see which creatures can be obtained at the current moment.\ncheck out your creatures with **!creatures**. to check out a specific creatures details, do **!creatures <creature>**.\nthere's also server-wide leaderboards that can be seen by doing **!creaturestats** or **!creaturestats <creature>**")
                .addField("trading", "trading is a great way to obtain creatures, and interact with friends! do **!trade create <user>** to start a trade with that user")

            message.channel.send({embeds: [embed]});
        } 
        else if (args[0] == "fishing") {
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("fishing tutorial")
                .addField("fish", "by doing **!fish**, you can catch many different fish. view all the fish you have with **!fish list** and sell your fish with **!sell <fish> <amount>**, or if you want to sell all your fish, do **!sell fish**")
                .addField("chests", `you have a ${f.fixFPErrors(config.chestChance * 100)} to find a chest each time you fish! these chests can contain lots of useful things, like seeds, bait and flarins. see if you can find one!`)

            message.channel.send({embeds: [embed]});
        }
        else if (args[0] == "garden") {
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle("garden tutorial")
                .addField("garden", "your own personal garden! access it through **!garden**, and get a more detailed view with **!garden details**. you start with 2 plots, but you can get more later!")
                .addField("watering & dehydration", "your plants require water, as any plants do. be sure to water them at least once a day by doing **!water <plot>**\nsome plants require more or less water than others, so be sure to watch that. if a plant runs out of water, it becomes dehydrated. plants don't grow when they are dehydrated. you can see how long a plant has been dehyrdated for in **!garden details**")
                .addField("obtaining seeds", "get seeds from the eruption emporium through **!shop seeds**")
                .addField("planting", "plant your seeds you got from the shop with **!plant <plot> <seed>**")
                .addField("harvesting/cutting", "if your plant is grown, do **!harvest <plot>** in order to get the grown plants in your inventory. you can still cut ungrown plants with **!harvest <plot>**, but you wont get the plants and the seeds will be lost.")

            message.channel.send({embeds: [embed]});
        }
        else message.channel.send("sorry i dont know about that")
    }
}