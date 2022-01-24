const { MessageAttachment, MessageEmbed } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
    name: 'eggs',
    description: 'see what eggs you got',
    usage: "%PREFIX%eggs",
    alt: 'hatchery',
    async execute(client, message, args, user, userStats){
        if (args[0] != "details") {
            if (user.eggs.length == 0) return message.channel.send("You have no eggs");

            for (let i = 0; i < user.eggs.length; i++) {
                const egg = user.eggs[i];
                const eggFile = client.creatures.get(egg.name);
                const eggImage = new MessageAttachment(global.src + `/assets/creatures/${eggFile.name}Egg.png`, 'egg.png');

                const speedScale = 1 - (userStats.eggHatchSpeed - 1);
                const hatchTime = new Date((egg.hatchTime - ((new Date).getTime() - egg.obtained.getTime())) * speedScale).toCountdown();

                const willHatch = `<t:${parseInt((egg.obtained.getTime() + (egg.hatchTime * speedScale)) / 1000)}:f>`

                const embed = new MessageEmbed()
                    .setColor('#f0c862')
                    .setTitle("Egg " + (i + 1))
                    .setImage('attachment://egg.png')
                    .addField("hatches at", willHatch, true)
                    .addField("in", hatchTime, true);
                message.channel.send({ embeds: [embed], files: [eggImage]});
            }
        }
        else {
            const canvas = Canvas.createCanvas(132, 122);
            const context = canvas.getContext('2d');
            const nestFront = await Canvas.loadImage(global.src + '/assets/NestFront.png');
            const nestBack = await Canvas.loadImage(global.src + '/assets/NestBack.png');
            
            context.fillStyle = '#323c39';
            context.fillRect(0, 0, 132, 122);

            const offsets = [{x: 46,y: 34},
                            {x: 8,y: 60},
                            {x: 84,y: 60},
                            {x: 46,y: 86}]
            // egg 1
            for (let i = 0; i < 4; i++) {
                if (userStats.eggSlots < i) break;
                context.drawImage(nestBack, offsets[i].x, offsets[i].y, 42, 28);
                if (user.eggs[i]) {
                    var eggTex = await Canvas.loadImage(`./assets/creatures/${user.eggs[i].name}Egg.png`);
                    context.drawImage(eggTex,
                        0, 0, 
                        eggTex.naturalWidth, eggTex.naturalHeight - 4, 
                        offsets[i].x + 20 - Math.ceil(eggTex.naturalWidth / 2), offsets[i].y + 24 - eggTex.naturalHeight,
                        eggTex.naturalWidth,  eggTex.naturalHeight - 4);
                }
                context.drawImage(nestFront, offsets[i].x, offsets[i].y, 42, 28);
            }
            

            const attachment = new MessageAttachment(canvas.toBuffer(), 'eggs.png');
            message.channel.send({ files: [attachment] });
        }
    }
}   
