const Canvas = require('canvas');
Canvas.registerFont('./fonts/Notalot60.ttf', { family: 'Notalot60' });
const { MessageAttachment, MessageEmbed } = require('discord.js');
const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')

module.exports = {
    name: 'garden',
    description: 'view garden',
    usage: `%PREFIX%garden\n`
        + `%PREFIX%garden details`,
    async execute(client, message, args, user, userStats) {
        gardenFunctions.fixDefaultGarden(user);

        user.save();

        if (args[0] == "details") {
            let plantList = "";
            for (let i = 0; i < userStats.gardenPlots; i++) {
                let plant = user.garden.plants[i];
                let plantData = client.plants.get(plant.name);
                let t = "`";
                plantList += `${t}plot ${i + 1}: ${plant.name}${t}\n`
                if (plantData) {
                    let waterLevel = gardenFunctions.calculateWaterPercent(plant, userStats, plantData);
                    let grownMs = plantData.growTime - (plantData.growTime * gardenFunctions.calculateGrowthPercent(plant, userStats, plantData));
                    let grownTime = new Date(grownMs).toCountdown();
                    if (grownMs < 0) grownTime = "grown!";

                    plantList += `🌿**time until grown:** ${grownTime}\n`
                        + `💧**water level:** ${(waterLevel * 100).toFixed(2)}%\n`
                        + `🍂**dehydration:** ${new Date(plant.timeUnwatered).toCountdown()}\n`;
                }
            }
            if (plantList == "") plantList = "error";

            let gardenUpgrades = ["Better Equipment", "Sprinkler", "Fertilizer"]
            let upgradeList = "";
            for (const upgrade of user.upgrades) {
                if (!gardenUpgrades.includes(upgrade.name)) continue;
                let upgradeData = client.upgrades.get(upgrade.name);
                if (!upgradeData) { console.log(`couldnt find ${upgrade.name} data`); continue; }
                upgradeList += `**${upgradeData.name}** x${upgrade.count}
                                ❓${upgradeData.effect}\n`
            }

            const embed = new MessageEmbed()
                .setColor('#63e674')
                .setTitle(message.author.username + "'s garden")
            if (upgradeList != "") embed.addField("upgrades", upgradeList);
            embed.addField("plants", plantList);
            message.channel.send({ embeds: [embed] });
        }
        else {
            const canvas = Canvas.createCanvas(346, 200);
            const context = canvas.getContext('2d');
            const garden = await Canvas.loadImage('./assets/garden/GardenBase.png');
            const plot = await Canvas.loadImage('./assets/garden/Plot.png');
            const bars = await Canvas.loadImage('./assets/garden/Bars.png');

            context.drawImage(garden, 0, 0, canvas.width, canvas.height);
            for (let layer = 0; layer < 3; layer++) {
                let plotX = 30;
                let plotY = 58;
                for (let i = 0; i < userStats.gardenPlots; i++) {
                    let plant = user.garden.plants[i];
                    let plantData = client.plants.get(plant.name); // will be undefined if no plant
                    if (layer == 0) {
                        // plot
                        context.drawImage(plot, plotX, plotY, 84, 44);
                        // plant
                        if (plantData) {
                            let plantFileName = plant.name.split(' ').join(''); // remove all spaces
                            const plantTex = await Canvas.loadImage(`./assets/garden/plants/${plantFileName}.png`);
                            context.drawImage(plantTex, plotX, plotY - 14, 84, 58);
                        }
                        else if (plant.name != "none") {
                            context.font = '15px Notalot60';
                            context.fillStyle = '#ffffff';
                            context.fillText(plant.name, plotX + 30, plotY + 20);
                        }
                    }
                    else if (layer == 1 && plantData) {
                        let barLocX = 8;
                        let barLocY = 38;

                        // bars
                        context.drawImage(bars, plotX + barLocX, plotY + barLocY, 24, 14);
                        // water
                        context.fillStyle = '#639bff';
                        let waterBarSize = Math.clamp(20 * gardenFunctions.calculateWaterPercent(plant, userStats, plantData), 0, 20);
                        context.fillRect(plotX + barLocX + 2, plotY + barLocY + 2, waterBarSize, 4);
                        // growth
                        context.fillStyle = '#99e550';
                        let growthBarSize = Math.clamp(20 * gardenFunctions.calculateGrowthPercent(plant, userStats, plantData), 0, 20);
                        context.fillRect(plotX + barLocX + 2, plotY + barLocY + 8, growthBarSize, 4);
                    }

                    plotX += 36;
                    plotY += 18;
                    if (i == 3) {
                        plotX = 120;
                        plotY = 12;
                    }
                }
            }

            let date =  Date.nowWA();
            let timeFraction = date.getHours() + (date.getMinutes() / 60);
            let darkness = 0;
            if (date.betweenHours(20,6)) darkness = 0.6;
            else if (date.betweenHours(6,8)) darkness = 1 - (((timeFraction - 6) / 2) * 0.6)
            else if (date.betweenHours(18,20)) darkness = ((timeFraction - 18) / 2) * 0.6
            
            context.globalAlpha = darkness;
            context.globalCompositeOperation = "source-atop";
            context.drawImage(getDarkMask(canvas), 0, 0, canvas.width, canvas.height)
            context.globalAlpha = 1.0;
            context.globalCompositeOperation = "source-over";

            const attachment = new MessageAttachment(canvas.toBuffer(), 'garden.png');

            message.channel.send({ files: [attachment] });
        }
    }
}
function getDarkMask(masterCanvas) {
    const canvas = Canvas.createCanvas(masterCanvas.width, masterCanvas.height);
    const context = canvas.getContext('2d');

    //drawLight(context, 30, 60, 5, 60);
    //drawLight(context, 90, 70, 5, 60);
    //drawLight(context, 50, 150, 5, 60);

    context.globalCompositeOperation = "source-out";
    context.fillStyle = "#1f1d52";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-over";

    return canvas;
}
function drawLight(context, X, Y, innerRadius, outerRadius) {
    var grd = context.createRadialGradient(X, Y, innerRadius, X, Y, outerRadius);
    grd.addColorStop(0, "rgba(255, 255, 255, 255)");
    grd.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = grd;
    context.fillRect(X - outerRadius, Y - outerRadius, outerRadius * 2, outerRadius * 2);
}