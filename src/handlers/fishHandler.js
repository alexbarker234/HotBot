const fs = require('fs');

module.exports = (client, Discord) =>{
    const fishFiles = fs.readdirSync(global.src + '/fish').filter(file => file.endsWith('.js'));

    for (const file of fishFiles){
        const fish = require(global.src + `/fish/${file}`)
        if (fish.name) client.fish.set(fish.name, fish);
    }
}