const functions = require(global.src + '/functions/functions.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'bait',
    description: `change the bait you are currently using`,
    usage: "%PREFIX%bait <name>\n%PREFIX%bait none",
    async execute(client, message, args, user, userStats){  
        if (args[0]) {
            if (args[0] != "none") args[0] = args[0].toCaps();
            if (!client.bait.get(args[0]) && args[0] != "none") return message.channel.send("that bait doesnt exist!")

            let hasBait = false;
            for (const baitItem of user.inventory.bait)
                if (baitItem.name == args[0]) { hasBait = true; break; }
            
            if (!hasBait&& args[0] != "none") return message.channel.send("you dont have that bait D:");

            user.baitEquipped = args[0];
            user.save();
            if (args[0] == "none") message.channel.send("succesfully unequipped bait")
            else message.channel.send(`succesfully equipped ${args[0]}`)
        }
        else {
            let bait = user.baitEquipped;
            if (!bait) bait = "none";


             const embed = new MessageEmbed()
                .setColor('#1b46e0')
                .setTitle("current bait")
            if(bait == "none") embed.addField("current bait", `**none**`);
            else {
                let baitData = client.bait.get(bait)
                if (!baitData) return console.logger.warn(`error getting ${bait} data`);
                embed.addField(`${baitData.name}`, `${baitData.effect}`);
            }
            message.channel.send({ embeds: [embed] });
        }
    }
}   