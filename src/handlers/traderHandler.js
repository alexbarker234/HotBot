const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = (client, Discord) =>{
    const traderFiles = fs.readdirSync(global.src + '/traders').filter(file => file.endsWith('.js'));
    client.traders = new Collection();

    for (const file of traderFiles){
        const trader = require(global.src + `/traders/${file}`)
        trader.type = "trader";
        if (trader.id) client.traders.set(trader.id, trader);
    }
}