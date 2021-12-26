const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

let heat = ['cold', 'cool', 'lukewarm', 'hot', 'bubbling', 'boiling', 'evaporated']
const brewSpeed = 5;

module.exports = {
    name: 'brew',
    description: 'brew a potion',
    usage: "%PREFIX%brew add <amount> <plant>\n"
        + "%PREFIX%brew heat/stir/beat/fold",
    async execute(client, message, args, user, userStats){
        if (!functions.userHasUpgrade(user, "Cauldron")) 
            return message.channel.send("you have no cauldron to brew in! buy one from the shop")

        let actions = ['beat', 'stir', 'fold', 'mix']
        let actionPast = ['beat', 'stirred', 'folded', 'mixed']
        let heatEmoji = ['🧊','🧊', '♨️', '♨️', '🔥', '🔥', '🏜️']

        if (!args[0]){
            let stepString = "";
            let stepNum = 1;
            for (const step of user.brew.steps) {
                let stepInfo = "";
                if (heat.includes(step)) stepInfo = `you heated the brew until it was ${step}`
                else if (step == 'beat') stepInfo = `you beat the brew`
                else if (step == 'stir') stepInfo = `you stirred the brew`
                else if (step == 'fold') stepInfo = `you folded the brew`
                else if (step.includes('add')) {
                    let bits = step.split(' ');
                    let itemName = bits[2];
                    for (let i = 3; i < bits.length; i++) itemName += " " + bits[i];
                    stepInfo = `you added ${bits[1]} ${itemName} into the brew`
                }

                stepString += `**${stepNum}.** ${stepInfo}\n`;
                stepNum++;
            }
            if (!stepString) return message.channel.send("you are not currently brewing anything")

            let expires = new Date(config.brewExpiry - (Date.now() - user.brew.started.getTime())).toCountdown();

            const embed = new MessageEmbed()
                .setColor('#80ede6')
                .setTitle(message.author.username + "'s cauldron")
                .addField("method", stepString, true)
                .addField("expires", expires, true);
            return message.channel.send({ embeds: [embed] });
        } 
        if (args[0] && !user.brew.started) user.brew.started = new Date();

        if (args[0] == "add") {
            if (isNaN(parseInt(args[1]))) return message.channel.send("you gotta specify a number to add")

            let itemName = args[2];
            for (let i = 3; i < args.length; i++) itemName += " " + args[i];
            itemName = itemName.toCaps();

            let subInv;
            let itemExists = false;
            ['fish','plants'].forEach(itemType => {
                if (client[itemType].get(itemName)) itemExists = true;

                for (const item of user.inventory[itemType]) {
                    if (item.name == itemName){
                        subInv = itemType;
                        if (item.count < args[1]) return message.channel.send(`you dont have enough ${itemName}`)
                        break;
                    }
                }
            });
            if (!itemExists) return message.channel.send(`${itemName} doesn't exist`)
            if (!subInv) return message.channel.send(`you dont have any ${itemName}`)

            functions.removeThingFromUser(user.inventory[subInv], itemName, args[1])

            user.brew.steps.push(`${args[0]} ${args[1]} ${itemName}`);
            message.channel.send(`you added ${args[1]} ${itemName} to the brew`)
        }
        else if (args[0] == "heat") {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setEmoji('🔥')
                        .setLabel('start heating')
                        .setStyle('PRIMARY')
                )

            message.channel.send({
                content:"start heating your brew?", 
                components: [row]
                })
            
            const filter = (i) => i.user.id === message.author.id;
            const collector = message.channel.createMessageComponentCollector({
                filter
            })
            let seconds = 0;
            let counter;
            collector.on('collect', i => {
                if (i.customId == "start") {
                    const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('stop')
                        .setEmoji('🛑')
                        .setLabel('stop heating')
                        .setStyle('DANGER')
                    )

                    if (!counter) {
                        counter = setInterval(function() {
                            if (seconds % brewSpeed == 0) {
                                let index = parseInt(seconds / brewSpeed);
                                i.message.edit({
                                    content:`your brew is ${heatEmoji[index]} ${heat[index]}`,
                                    components: [row],
                                    embeds: []
                                })
                            }
                            seconds++;
                            if (seconds > brewSpeed * (heat.length - 1)){
                                clearInterval(counter);
                                finishHeating(user,i.message, seconds);
                                collector.stop();
                            }
                        }, 1000)
                    }
                }
                else if (i.customId == "stop") {
                    if (counter) clearInterval(counter);
                    else console.log("error stopping heating")
                    finishHeating(user,i.message, seconds);
                    collector.stop();
                }
                i.deferUpdate(); // stops the fail message
                //console.log(`Collected ${i.customId}`)
            });
        }
        else if (actions.includes(args[0])) {
            user.brew.steps.push(args[0]);

            let stepInfo = "";
            if (args[0] == 'beat') stepInfo = `you beat the brew`
            else if (args[0] == 'stir') stepInfo = `you stirred the brew`
            else if (args[0] == 'fold') stepInfo = `you folded the brew`
            message.channel.send(stepInfo);
        } 
        else if (args[0] == "complete"){
            let stepString = "";
            for (const step of user.brew.steps) {
                if (stepString != "") stepString += "-";
                stepString += step;
            }
            console.log(`${message.author.username} tried to brew with steps ${stepString}`)
            let potionBrewed = "";
            for (const [name, potion] of client.potions) {
                if (potion.steps == stepString) {
                    potionBrewed = potion.name;
                    break;
                }
            }
            user.brew.steps = [];
            user.brew.started = null;
            if (potionBrewed == "") message.channel.send("you didn't make anything :(")
            else{
                functions.addThingToUser(user.inventory.potions,potionBrewed, 1);
                message.channel.send(`you brewed 1 ${potionBrewed}`)
            } 
        }
        else return message.channel.send("thats not a command")
        user.save()
    }
}   
function finishHeating(user, msg, seconds) {
    msg.edit({content: `you heated the brew until it was ${heat[parseInt(seconds / brewSpeed)]}`, components: [], embeds: []})
    user.brew.steps.push(heat[parseInt(seconds / brewSpeed)])
    user.save();
}
