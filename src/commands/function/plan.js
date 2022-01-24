const { MessageEmbed } = require('discord.js');
const Database = require("@replit/database");
const db = new Database();
/**
 * TODO
 * add a reminder ping
 */
module.exports = {
    name: 'plan',
    description: 'create a plan',
    usage: "%PREFIX%plan create [date] [description]\n"
    + "%PREFIX%plan edit [id] [date] [description]",
    async execute(client, message, args, user, userStats){
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send("**correct usage: **\n" + this.usage);

        if (args[0] == "create" || args[0] == "test")
        {
            let desc = args[2];
            for (let i = 3; i < args.length; i++) desc += " " + args[i] ;

            let pieces = args[1].split("/");
            let date = args[1]; 
            if (pieces[0].length <= 2) date = pieces[1] + "/" + pieces[0] + "/" + pieces[2]; // converts from the right way to the american way

            let parsedDate = Date.parse(date);

            if (isNaN(parsedDate)) return message.channel.send("that's not a real date");
            if (Math.trunc(parsedDate / 86400000) < Math.trunc(Date.now() / 86400000)) return message.channel.send("that's before today, are you sure?");
            
            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(desc + " on " + args[1])
                .addField("can go", 'no one', true)
                .addField("can't go", 'no one', true)
                .addField("perhaps", 'no one', true)

            const planMsg = await message.channel.send({embeds: [embed]});

            embed.setFooter("id: " + planMsg.id);
            await planMsg.edit({embeds: [embed]}); // to add id footer

            try {
                await planMsg.react('👍');
                await planMsg.react('👎');
                await planMsg.react('🤷');
            } catch (error) {
                console.error('One of the emojis failed to react:', error);
            }   
        
            if (args[0] != "test") db.set(planMsg.id, parsedDate).then(() => {});  
            else message.channel.send("this is a test, none of the reactions will do anything");
        }
        else
        {
            let desc = args[3];
            for (let i = 4; i < args.length; i++) desc += " " + args[i];

            if (args[3]) {} // if description input, edit it 

            const planMsg = await message.channel.messages.fetch(args[1]);
            const oldEmbed = planMsg.embeds[0];

            let newDesc = oldEmbed.title.substring(0,oldEmbed.title.indexOf("on"))
            if (args[3]) newDesc = desc;

            const embed = new MessageEmbed()
                .setColor('#f0c862')
                .setTitle(newDesc + " on " + args[2])
                .setFooter("id: " + args[1]);
            oldEmbed.fields.forEach(field => embed.addField(field.name, field.value, field.inline));


            planMsg.edit({embeds: [embed]});
        }
    }
}