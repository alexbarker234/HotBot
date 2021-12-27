const creatureUserModel = require('../../models/creatureUserSchema');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const functions = require('../../functions.js')

module.exports = {
    name: 'creaturestats',
    description: 'get an overview of how many creatures the server has',
    usage: "%PREFIX%creaturestats <creature>",
    async execute(client, message, args, user, userStats){
        // for creature specific stats
        if (args[0]) {
            // capitalise first char
            args[0] = args[0].charAt(0).toUpperCase() + args[0].slice(1);
            if (!client.creatures.get(args[0])) return message.channel.send("cant find that creature");
        }

        let creatureMap = new Map();
        let mostCreatures = [{id : "", count : 0}];

        await creatureUserModel.find({} , (err, users) => {
            if(err) console.log(err);
            
            users.map(user => {
                if (user.creatures.length > 0 && user.guildID == message.guild.id){
                    let total = 0;
                    for (const creature of user.creatures) {
                        if (args[0] && creature.name != args[0]) continue; // for creature specific stats

                        total += creature.count;
                        if (args[0]) {
                            let map = creatureMap.get(user.userID);
                            if (map) map.count += creature.count;
                            else creatureMap.set(user.userID, {count: creature.count});
                        }
                        else {
                            let map = creatureMap.get(creature.name);
                            if (map) map.count += creature.count;
                            else creatureMap.set(creature.name, {count: creature.count});
                        }
                    }
                    if (total > mostCreatures[0].count && total != 0) mostCreatures = [{id: user.userID, count: total}]
                    else if (total == mostCreatures[0].count && total != 0) mostCreatures.push({id: user.userID, count: total});
                }
            });
        });
        
        let total = 0;
        let creatures = "";
        let mostCreaturesString = "";
        for (const user of mostCreatures) if (user.id != "" ) mostCreaturesString += `<@!${user.id}>: ${user.count}\n`;
        
        if (mostCreaturesString == "") mostCreaturesString = "no one";

        creatureMap = creatureMap.sortMapObject("count");

        // creature specific
        if (args[0]){
            for (const [name, creature] of creatureMap.entries()) {
                creatures += "<@!" + name + ">: " + creature.count + "\n";
                total += creature.count;
            }
            if (total == 0) return message.channel.send("no one has found this creature yet")

            const creatureFile = client.creatures.get(args[0]);
            const creatureImage = new MessageAttachment(`./assets/creatures/${creatureFile.name}.png`, 'creature.png');

            args[0] = args[0].toLowerCase();
            if (creatures == "") creatures = "nothing";

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.guild.name + "'s " + args[0] + " statistics!")
                .addField("total " + args[0] + "s", `${total}`)
                .addField("most " + args[0] + "s", mostCreaturesString)
                .addField(args[0]+ " counts", creatures)
                .setImage('attachment://creature.png');
            message.channel.send({embeds: [embed], files : [creatureImage]});      
        }
        // server wide
        else {
            for (const [name, creature] of creatureMap.entries()) {
                let emoji = functions.getEmojiFromName(client, name);
                creatures += `${emoji} **${name}**: ${creature.count}\n`;
                total += creature.count;
            }
            if (creatures == "") creatures = "nothing";

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(message.guild.name + "'s creature statistics!")
                .addField("total creatures", `${total}`)
                .addField("most creatures", mostCreaturesString)
                .addField("creature counts", creatures);
            message.channel.send({embeds: [embed]});       
        }
    }
}