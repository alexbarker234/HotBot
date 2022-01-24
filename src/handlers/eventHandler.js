const fs = require('fs');

module.exports = (client, Discord) =>{
    const loadDir = (dirs) =>{
        const eventFiles = fs.readdirSync(global.src + `/events/${dirs}`).filter(file => file.endsWith('.js'));

        for (const file of eventFiles){
            const event = require(global.src + `/events/${dirs}/${file}`)
            const eventName = file.split('.')[0];
            client.on(eventName,event.bind(null, Discord, client)) // title of the file must be called the event
        }
    }
    ['client', 'guild'].forEach(e => loadDir(e));
}