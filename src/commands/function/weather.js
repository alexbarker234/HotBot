const { MessageEmbed } = require('discord.js');
const functions = require(global.src + '/functions/functions.js');
const creatureUserModel = require(global.src + '/models/creatureUserSchema')

module.exports = {
    name: 'weather',
    description: 'get the current weather. useful for finding specific eggs',
    usage: "%PREFIX%weather",
    async execute(client, message, args, user, userStats){
        let weather = client.weatherCache;
        const time = Date.nowWA();
        const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle('current weather')
                .addField("⛅ weather", weather.weather + (functions.userHasBoost(user, "Raincaster") ? " (Raincaster)" : ""))
                .addField("🌡️ temperature", weather.temperature.toFixed(2) + "°C")
                .addField("💨 wind speed", weather.windspd + "m/s\n" + (weather.windspd * 3.6).toFixed(2) + "km/h")
                .addField("☁️ clouds", weather.clouds + "%")
                .addField("🌙 moon phase", functions.getMoonPhase(time.getFullYear(), time.getMonth(), time.getDate()).name)
        message.channel.send({embeds: [embed]});
    }
}