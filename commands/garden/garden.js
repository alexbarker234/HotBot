const Canvas = require('canvas');
Canvas.registerFont('./fonts/Notalot60.ttf', { family: 'Notalot60' });
const { MessageAttachment, MessageEmbed } = require('discord.js');
const creatureUserModel = require('../../models/creatureUserSchema');
const config = require("../../config.json");
const gardenFunctions = require('../../gardenFunctions.js')
const functions = require('../../functions.js')

const plantLightMap = new Map();
// perhaps make images with dots where the light sources should be
plantLightMap.set("Chardaisy", [
    { X: 17, Y: 37, strength: 10 },
    { X: 29, Y: 31, strength: 10 },
    { X: 41, Y: 25, strength: 10 },
    { X: 53, Y: 19, strength: 10 },
    { X: 29, Y: 43, strength: 10 },
    { X: 41, Y: 37, strength: 10 },
    { X: 53, Y: 31, strength: 10 },
    { X: 65, Y: 25, strength: 10 },
])
plantLightMap.set("Ashdrake", [
    { X: 27, Y: 35, strength: 20 },
    { X: 45, Y: 19, strength: 20 },
    { X: 63, Y: 13, strength: 20 }
])
plantLightMap.set("Coalsprout", [
    { X: 23, Y: 33, strength: 30 },
    { X: 52, Y: 19, strength: 30 }
])
plantLightMap.set("Sparklethorn", [
    { X: 29, Y: 24, strength: 30 },
    { X: 51, Y: 13, strength: 30 }
])
plantLightMap.set("Starlight Spud", [
    { X: 26, Y: 44, strength: 20 },
    { X: 43, Y: 37, strength: 30 },
    { X: 59, Y: 28, strength: 30 }
])
module.exports = {
    name: 'garden',
    description: 'view garden',
    usage: `%PREFIX%garden\n`
        + `%PREFIX%garden details`
        + `%PREFIX%garden fence <fence>`,
    async execute(client, message, args, user, userStats) {
        gardenFunctions.fixDefaultGarden(user);

        user.save();

        if (args[0] == "details") {
            let plantList = [];
            for (let i = 0; i < userStats.gardenPlots; i++) {
                let plant = user.garden.plants[i];
                let plantData = client.plants.get(plant.name);
                let t = "`";
                let arrayData = []
                arrayData[0] = `plot ${i + 1}: ${plant.name}`
                if (plantData) {
                    let waterLevel = gardenFunctions.calculateWaterPercent(plant, userStats, plantData);
                    let grownMs = plantData.growTime - (plantData.growTime * gardenFunctions.calculateGrowthPercent(plant, userStats, plantData));
                    let grownTime = new Date(grownMs).toCountdown();
                    if (grownMs <= 0) grownTime = "grown!";

                    arrayData[1] = `${t}🌿growth🌿${t}\n`
                        + `- **time until grown:** ${grownTime}\n`
                        + `- **grow time:** ${new Date(plantData.growTime).toCountdown()}\n`
                        + `- **boosted grow time:** ${new Date(gardenFunctions.calculateGrowTime(userStats, plantData)).toCountdown()}\n\n`
                        + `${t}💧water💧${t}\n`
                        + `- **water level:** ${(waterLevel * 100).toFixed(2)}%\n`
                        + `- **water rate:** ${new Date(plantData.waterRate).toCountdown()}\n`
                        + `- **boosted water rate:** ${new Date(gardenFunctions.calculateWaterRate(userStats, plantData)).toCountdown()}\n\n`
                        + `🍂**dehydration:** ${new Date(plant.timeUnwatered).toCountdown()}\n`;
                    /*arrayData[1] = `🌿**time until grown:** ${grownTime}\n`
                        + `-grow time: ${new Date(plantData.growTime).toCountdown()} ⏫ *${new Date(gardenFunctions.calculateGrowTime(userStats, plantData)).toCountdown()}* ⏫\n`
                        + `💧**water level:** ${(waterLevel * 100).toFixed(2)}%\n`
                        + `-water rate: ${new Date(plantData.waterRate).toCountdown()} ⏫ *${new Date(gardenFunctions.calculateWaterRate(userStats, plantData)).toCountdown()}* ⏫\n`
                        + `🍂**dehydration:** ${new Date(plant.timeUnwatered).toCountdown()}\n`;*/
                }
                plantList.push(arrayData);
            }

            let gardenUpgrades = ["Better Equipment", "Sprinkler", "Fertilizer"]
            let upgradeList = "";
            for (const upgrade of user.upgrades) {
                if (!gardenUpgrades.includes(upgrade.name)) continue;
                let upgradeData = client.upgrades.get(upgrade.name);
                if (!upgradeData) { console.log(`couldnt find ${upgrade.name} data`); continue; }
                upgradeList += `**${upgradeData.name}** x${upgrade.count}\n`
                    + `❓${upgradeData.effect}\n`
            }

            const embed = new MessageEmbed()
                .setColor('#63e674')
                .setTitle(message.author.username + "'s garden")
            if (upgradeList != "") embed.addField("upgrades", upgradeList);
            for (plant of plantList) {
                embed.addField(plant[0], plant[1], true);
            }
            //if (plantList[0] != "") embed.addField("plants", plantList[0]);
            //if (plantList[1] != "") embed.addField("plants", plantList[1]);
            message.channel.send({ embeds: [embed] });
        }
        else if (["fence", "path"].includes(args[0])) {
            if (!args[1]) return message.channel.send(`please specify a ${args[1]} to decorate with`)
            decorate(client, message.channel, user, args[0], args.slice(1).join(' ').toCaps())
        }
        else {
            let lightSources = [];

            let fenceType = user.garden.fence;
            let fence;
            let fenceHeight = 0;
            if (fenceType && fenceType != "") {
                fence = await Canvas.loadImage(`./assets/garden/fences/${fenceType.replaceAll(" ", "")}.png`);
                fenceHeight = fence.naturalHeight - 86;
            }

            let pathType = user.garden.path;
            let path;
            if (pathType && pathType != "") {
                path = await Canvas.loadImage(`./assets/garden/paths/${pathType.replaceAll(" ", "")}.png`);
            }

            // path offset = 88 , 42
            const canvas = Canvas.createCanvas(346, 200 + fenceHeight);
            const context = canvas.getContext('2d');
            const garden = await Canvas.loadImage('./assets/garden/GardenBase.png');
            const plot = await Canvas.loadImage('./assets/garden/Plot.png');
            const bars = await Canvas.loadImage('./assets/garden/Bars.png');

            context.drawImage(garden, 0, fenceHeight, garden.naturalWidth, garden.naturalHeight);
            if (fence) context.drawImage(fence, 0, 0, fence.naturalWidth, fence.naturalHeight);
            if (path) context.drawImage(path, 89, 40 + fenceHeight, path.naturalWidth, path.naturalHeight);
            for (let layer = 0; layer < 3; layer++) {
                // LIGHTING
                if (layer == 1) {
                    let date = Date.nowWA();
                    let timeFraction = date.getHours() + (date.getMinutes() / 60);
                    let darkness = 0;
                    if (date.betweenHours(20, 6)) darkness = 0.6;
                    else if (date.betweenHours(6, 8)) darkness = 1 - (((timeFraction - 6) / 2) * 0.6)
                    else if (date.betweenHours(18, 20)) darkness = ((timeFraction - 18) / 2) * 0.6

                    context.globalAlpha = darkness;
                    context.globalCompositeOperation = "source-atop";
                    context.drawImage(getDarkMask(canvas, lightSources), 0, 0, canvas.width, canvas.height)
                    context.globalAlpha = 1.0;
                    context.globalCompositeOperation = "source-over";
                }
                // PLOTS
                let plotX = 30;
                let plotY = 58 + fenceHeight;
                for (let i = 0; i < userStats.gardenPlots; i++) {
                    let plant = user.garden.plants[i];
                    let plantData = client.plants.get(plant.name); // will be undefined if no plant
                    if (layer == 0) {
                        // plot
                        context.drawImage(plot, plotX, plotY, 84, 44);
                        let lightData = plantLightMap.get(plant.name);
                        if (lightData) {
                            for (const light of lightData)
                                lightSources.push({ X: light.X + plotX, Y: light.Y + plotY - 14, strength: light.strength })
                        }
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
                    else if (layer == 2 && plantData) {
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

            const attachment = new MessageAttachment(canvas.toBuffer(), 'garden.png');

            message.channel.send({ files: [attachment] });
        }
    }
}
function decorate(client, channel, user, type, name) {
    if (name == "None") {
        user.garden[type] = "";
        return channel.send(`set garden ${type} to none`)
    }
    let decor;
    for (const decoration of user.inventory.decorations)
        if (decoration.name == name) decor = decoration.name;
    if (!decor) return channel.send("you dont have that")
    let decorData = functions.getItem(client, decor)
    if (!decorData || decorData.decorType != type) return channel.send(`thats not a ${type}`)

    user.garden[type] = name;
    channel.send(`set garden ${type} to ${name}`)
}
function getDarkMask(masterCanvas, lightSources) {
    const canvas = Canvas.createCanvas(masterCanvas.width, masterCanvas.height);
    const context = canvas.getContext('2d');

    for (const light of lightSources)
        drawLight(context, light.X, light.Y, Math.ceil(0.2 * light.strength), light.strength);

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