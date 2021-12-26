const { MessageCollector } = require('discord.js');

module.exports = {
    name: 'rolldice',
    description: 'roll a dice. default is 6',
    usage: '%PREFIX%rolldice <sides>\n'
    + '%PREFIX%rolldice <guess> <sides>\n'
    + '%PREFIX%rolldice <guess> <sides> <count>\n'
    + 'you can also switch up argument order by doing arg:x - for example !rolldice count:2 will role 2 six sided die',
    alt: 'rolldie',
    execute(client, message, args, user, userStats){

        //if (message.author.id == "799878556368896030") return message.channel.send("you arent allowed to win");
        let guess;
        let count;    
        let sides = "6";

        let customArgs = false;
        for (const arg of args){
            if(arg.startsWith("guess:")) { guess = arg.replace("guess:", ""); customArgs = true }
            else if(arg.startsWith("sides:")) { sides = arg.replace("sides:", ""); customArgs = true }
            else if(arg.startsWith("count:")) { count = arg.replace("count:", ""); customArgs = true }
        }
        if (!customArgs) {
            if (!args[1] && args[0]) sides = args[0];
            else if (args[0] && args[1]) {
                sides = args[1];
                guess = args[0];
            }
            if (args[2]) count = args[2];
        }
        if (guess) {
            if (guess.startsWith("<@")) return message.channel.send("you guessed " + guess + "... i dont think they are on the dice")
        }
        if (sides){
            if (sides.startsWith("<@")) {    
                if (Math.floor(Math.random() * 10) == 0) return message.channel.send("you yeeted " + sides + "! they are a ninja and landed on their feet. run.");
                return message.channel.send("you yeeted " + sides + "! they landed on their " + (Math.floor(Math.random() * 2) == 0 ? "face" : "stomach"));
            } 
        }

        if (isNaN(sides) && sides) return message.channel.send(sides + "..? thats not a number");
        else if (isNaN(guess) && guess) return message.channel.send(guess + "..? thats not on the dice");
        else if (isNaN(count) && count) return message.channel.send(count + "..? i cant throw " + count + " dice");

        sides = Number(sides);
        if (guess) guess = Number(guess);
        if (count) count = Number(count);

        if (count > 20) return message.channel.send("no. i am not rolling that many");
        else if (sides == 2) return message.channel.send("are you trying to flip a piece of paper?");
        else if (sides == 1) return message.channel.send("how do you get a 1 sided dice?");
        else if (sides == 0) return message.channel.send("bots cant see imaginary dice")
        else if (sides < 0) return message.channel.send("no anti-dice here, sorry")
        else if (sides < 0) return message.channel.send("i dont think a negative number is on the dice")
        else if ((guess && guess % 1 != 0) || sides % 1 != 0) return message.channel.send("this isnt harry potter, no decimal rolls");
        else if (count && count % 1 != 0) return message.channel.send("you want me to throw " + count + " die? sure let me whip out my chainsaw");
        else if (guess > sides) return message.channel.send("are you trying to lose? why are you guessing a number higher than the sides?");


        //console.log(args[0] + " | " + args[1]);

        if (sides > 1000) {
            const filter = m => m.author.id == message.author.id;

            const collector = new MessageCollector(message.channel, filter, {
                max: 1,
                time: 15 * 1000, // 15s
            });
            message.channel.send("thats a big dice babe, you sure?");
            
            const yessir = ["yes", "yeah", "ye", "yea","y"];

            collector.on("collect", m => {
                if (yessir.includes(m.content.toLowerCase())) {
                    sendGuess(message, sides, guess, count);
                }
            });

            collector.on("end", collected => {
                console.log("collected");
            });
            return;
        }

        sendGuess(message, sides, guess, count);
    }
}
function sendGuess(message, sides, guess, count){
    if (!count) count = 1;
    toSend = "";
    for (let i = 0; i < count; i++) {
        let roll = Math.floor(Math.random() * sides + 1);
        if (guess) {
            toSend += "you guessed " + guess + " and rolled " + roll + " on a " + sides + " sided die," + (roll == guess ? " you win!" : " sorry babe") + "\n";
        }
        else toSend += "you rolled a " + sides + " sided die and got " + roll + "\n";
    }
    message.channel.send(toSend);
};