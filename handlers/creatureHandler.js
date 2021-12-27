const fs = require('fs');

module.exports = (client, Discord) =>{
    const creatureFiles = fs.readdirSync('./creatures').filter(file => file.endsWith('.js'));

    for (const file of creatureFiles){
        const creature = require(`../creatures/${file}`)
        creature.type = "creature";
        if (creature.name) client.creatures.set(creature.name, creature);
    }
}