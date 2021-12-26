var fs = require('fs');

module.exports = {
    name: 'time',
    description: 'check internal time',
    usage: "%PREFIX%time",
    admin: true,
    execute(client, message, args, user, userStats){
        const time = Date.nowWA();
        message.channel.send(
            "time: " + time.getHours() + ":" + time.getMinutes() + "\n" +
            "date: " + time.getDate() + "\n" +
            "day: " + time.getDay()
        )
    }
}   