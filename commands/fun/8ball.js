module.exports = {
    name: '8ball',
    description: 'ask the magic 8 ball',
    usage: "%PREFIX%8ball",
    execute(client, message, args, user, userStats){
        let response = "";
        if (Math.floor(Math.random() * 100 == 0)) return message.channel.send("why do you put your life to chance?")

        let desc = "";
        for (let i = 0; i < args.length; i++) desc += " " + args[i] ;

        let rng = Math.floor(Math.random() * 20);
        let responses = [
            // positive
            "absolutely, babe <3",
            "yeah totally",
            "dont see why not",
            "most likely :)",
            "certainly!",
            "i have no doubts, yes!",
            "everything says yes",
            "of course",
            "never say never",
            "looks good to me",
            // idfk sir
            "i dont think i should say...",
            "not sure",
            "i cannot predict",
            "uh, try again",
            "think about it really hard then ask me again",
            //negative
            "no <3",
            "mmm, i dont think so",
            "that aint it chief :(",
            "doesnt look good to me :grimacing:",
            "no chance"
        ];
        // make hotbot always say they arent lying >:)  
        const lies = ["lie", "lying"];
        for (const lie of lies) {
            if (desc.includes(lie)) { 
                rng = 15 + Math.floor(Math.random() * 5); 
                break;
            }
        }
        response = responses[rng];

        if (rng < 10) response = ":green_circle: " + response;
        else if (rng < 15) response = ":yellow_circle: " + response;
        else if (rng < 20) response = ":red_circle: " + response;
        message.channel.send(response);
    }
}