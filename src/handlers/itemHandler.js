const fs = require('fs');

module.exports = (client, Discord) =>{
    // bruh
    let itemsNormal = ["bait", "plants", "seeds", "potions", "misc"]; // need a better way to do this, recursion perhaps?
    // define things
    client.items = [];

    const itemPath = global.src + `/items`;
    const itemTypes = fs.readdirSync(itemPath)
    // loop through each item file
    for (const itemType of itemTypes){ 
        client[itemType] = new Discord.Collection();  // perhaps should just have 1 giant item collection
        client.items.push(itemType);
        // for items not divided into sections
        if (itemsNormal.includes(itemType)) {        
            const items = fs.readdirSync(itemPath + `/${itemType}`).filter(file => file.endsWith('.js'));       
            // loop through each item  
            for (const item of items){
                const itemData =  require(itemPath + `/${itemType}/${item}`);
                itemData.type = itemType;
                if (itemData.name) client[itemType].set(itemData.name, itemData);
            }
        }
        // for items divided into sections
        else {
            const subfiles = fs.readdirSync(itemPath + `/${itemType}`);
            // loop through sub-files (eg creatures/fishing/garden)        
            for (const subfile of subfiles){
                const items = fs.readdirSync(itemPath + `/${itemType}/${subfile}`).filter(file => file.endsWith('.js'));         
                // loop through each item
                for (const item of items){
                    const itemData =  require(itemPath + `/${itemType}/${subfile}/${item}`);
                    itemData.type = itemType;
                    if (itemData.name) client[itemType].set(itemData.name, itemData);
                }
            }
        }
    }
}