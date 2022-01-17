const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed } = require('discord.js');
const functions = require('../../functions.js')
const fishFunctions = require('../../fishFunctions.js')

module.exports = {
    name: 'fishtest',
    description: 'test fish things',
    usage: "%PREFIX%fishtest [chance] [bias strength] [bonus chance]",
    admin: true,
    async execute(client, message, args, user, userStats) {
        if (args[0] == "user") {
            let sampleSize = args[1] ? Number(args[1]) : 20000;
            let caughtList = [];
            let chestList = [];
            const userStats = await functions.getUserStats(client, message.author.id, message.guild.id);
            let value = 0;

            for (let i = 0; i < sampleSize; i++) {
                if (Math.random() < userStats.fishChance) {
                    let bonus = Math.random() < 0.7 && user.baitEquipped == "Bloodleech" ? 2 : 1;
                    for (let i = 0; i < bonus; i++) {
                        const fish = fishFunctions.chooseFish(client, user.baitEquipped == "Toxicane" ? 0.7 : 0);
                        if (!fish) return console.log("error getting fish");

                        functions.addThingToUser(user.inventory.fish, fish.name, 1);
                        caughtList.push(fish.name);
                        value += fish.price;
                    }
                }
                // CHESTS
                if (Math.random() < userStats.chestChance) chestList.push(await fishFunctions.chooseChestRewards(client, user, false));
            }
            message.channel.send(`times fished: ${sampleSize}\n`
                + `total flarins: ${value}\n`
                + `total chests: ${chestList.length}\n`
                + `average flarins per fish: ${value / sampleSize}\n`
                + `\nbait: ${user.baitEquipped}`)
        }
        else {
            let sampleSize = 20000;
            let value = 0;
            let fishChance = args[0] ? Number(args[0]) : 0.3;
            let biasStrength = args[1] ? Number(args[1]) : 0;
            let bonusChance = args[2] ? Number(args[2]) : 0;

            let total = 0;
            let probabilityMap = new Map();
            for (const [name, fish] of client.fish) {
                total += fish.rarity();
                probabilityMap.set(fish.name, { count: 0 });
            }


            let succesfulCatches = 0;
            for (let i = 0; i < sampleSize; i++) {
                if (Math.random() >= fishChance) continue;

                let bonus = 1;
                bonus = Math.random() < bonusChance ? 2 : 1;
                for (let i = 0; i < bonus; i++) {
                    succesfulCatches++;
                    const fish = fishFunctions.chooseFish(client, biasStrength);
                    probabilityMap.get(fish.name).count++;
                    value += fish.price;
                }
            }
            let fish = "**name  |  probability  |  intended**\n";

            probabilityMap = probabilityMap.sortMapObject("count");

            for (const [name, value] of probabilityMap) {
                fish += `${name}  |  ${((value.count / succesfulCatches) * 100).toFixed(2)}  | ${((client.fish.get(name).rarity() / total) * 100).toFixed(2)} \n`;
            }


            message.channel.send(`${fish}\n\nflarins per fish: ${value / sampleSize}`)
        }
        // stats
        // 50% chance - 18.31 flarins per fish
        // 50% bonus chance with 30% fish chance - 15.9785
    }
}   