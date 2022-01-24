const functions = require(global.src + '/functions/functions.js');

module.exports = {
    name: 'weathertest',
    description: 'weatherTest',
    usage: "%PREFIX%weatherTest",
    admin: true,
    async execute(client, message, args, user, userStats){  
        let weather = await functions.getWeather();
        console.log(weather);
    }
}   